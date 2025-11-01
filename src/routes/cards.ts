import express from 'express';
import { PrismaClient } from '@prisma/client';
import { viewRateLimit } from '../middleware/rateLimit';

const prisma = new PrismaClient();
const router = express.Router();

// Serve individual card page with Twitter Card metadata
router.get('/:slug', viewRateLimit, async (req, res) => {
  // Skip certain routes that shouldn't be treated as card slugs
  const { slug } = req.params;
  if (['health', 'api', 'uploads', 'favicon.ico'].includes(slug)) {
    return res.status(404).send('Not found');
  }
  
  try {
    
    // Find card in database
    const card = await prisma.card.findUnique({
      where: { slug }
    });

    if (!card) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Card Not Found - Lynx</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>Card Not Found</h1>
          <p>The requested card could not be found.</p>
          <a href="/">Create a new card</a>
        </body>
        </html>
      `);
    }

    // Increment click count
    await prisma.card.update({
      where: { slug },
      data: { clickCount: { increment: 1 } }
    });

    // Record click analytics
    await prisma.click.create({
      data: {
        cardSlug: slug,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || null,
        referrer: req.get('Referer') || null
      }
    });

    // Get the full image URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}${card.imageUrl}`;
    const cardUrl = `${baseUrl}/${slug}`;

    // Escape targetUrl for safe use in HTML attributes
    const escapedTargetUrl = card.targetUrl
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Always use summary_large_image for consistent prominent display
    const twitterCardType = 'summary_large_image';

    // Generate Twitter Card metadata
    const twitterCardHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
        <!-- Twitter Card metadata -->
        <meta name="twitter:card" content="${twitterCardType}">
        <meta name="twitter:site" content="@lampbylit">
        <meta name="twitter:title" content="${card.title || '&#8203;'}">
        <meta name="twitter:description" content="${card.description || 'Click to visit the link'}">
        <meta name="twitter:image" content="${imageUrl}">
        <meta name="twitter:url" content="${cardUrl}">
        
        <!-- Open Graph metadata -->
        <meta property="og:url" content="${cardUrl}">
        <meta property="og:type" content="website">
        <meta property="og:title" content="${card.title || '&#8203;'}">
        <meta property="og:description" content="${card.description || 'Click to visit the link'}">
        <meta property="og:image" content="${imageUrl}">
        
        <title>${card.title || 'Card Link'}</title>
        
        <!-- Meta refresh fallback for mobile browsers -->
        <meta http-equiv="refresh" content="1;url=${escapedTargetUrl}">
        
        <!-- Instant JavaScript redirect for human visitors (attempts first, before meta refresh) -->
        <script>
          (function() {
            // Improved bot detection: only match actual crawler patterns
            // Twitter mobile app browser may contain "twitter" but is NOT a bot
            // Twitter's actual crawler is "Twitterbot" or contains "bot" specifically
            const userAgent = navigator.userAgent.toLowerCase();
            // Match specific bot patterns: contains "bot" (but not standalone "twitter"),
            // or contains crawler/spider patterns, or known bot user agents
            const isBot = /\b(bot|crawler|spider|crawling)\b|facebookexternalhit|facebookbot|twitterbot|linkedinbot|telegrambot|slackbot|discordbot|embedder|googlebot|baiduspider|bingbot|yandexbot/i.test(userAgent);
            
            // Check if JavaScript is enabled and this is a real browser
            if (!isBot && typeof window !== 'undefined') {
              try {
                // Try immediate redirect
                window.location.replace(${JSON.stringify(card.targetUrl)});
              } catch (e) {
                // Fallback: use href if replace fails
                window.location.href = ${JSON.stringify(card.targetUrl)};
              }
            }
          })();
        </script>
        
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 500px;
            width: 100%;
            overflow: hidden;
          }
          .card-image {
            width: 100%;
            height: 250px;
            object-fit: cover;
          }
          .card-content {
            padding: 20px;
          }
          .card-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #1a1a1a;
          }
          .card-description {
            color: #666;
            margin: 0 0 20px 0;
            line-height: 1.5;
          }
          .redirect-message {
            color: #888;
            font-size: 0.9rem;
            text-align: center;
            margin-bottom: 15px;
          }
          .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 10px;
            vertical-align: middle;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .fallback-link {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: opacity 0.2s;
            text-align: center;
            width: 100%;
            box-sizing: border-box;
          }
          .fallback-link:hover {
            opacity: 0.9;
          }
          .fallback-link:active {
            opacity: 0.8;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <img src="${imageUrl}" alt="${card.title || ''}" class="card-image">
          <div class="card-content">
            <h1 class="card-title">${card.title || '&#8203;'}</h1>
            <p class="card-description">${card.description || 'Click to visit the link'}</p>
            <div class="redirect-message">
              <div class="spinner"></div>
              Redirecting you to the destination...
            </div>
            <a href="${escapedTargetUrl}" class="fallback-link" id="fallback-link">
              Click here if you are not redirected automatically
            </a>
          </div>
        </div>
      </body>
      </html>
    `;

    res.send(twitterCardHtml);

  } catch (error) {
    console.error('Card page error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - Lynx</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <h1>Something went wrong</h1>
        <p>We encountered an error while loading this card.</p>
        <a href="/">Create a new card</a>
      </body>
      </html>
    `);
  }
});

export default router;
