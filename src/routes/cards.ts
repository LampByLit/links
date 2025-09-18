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
        <meta name="twitter:title" content="${card.title || '&emsp;'}">
        <meta name="twitter:description" content="${card.description || 'Click to visit the link'}">
        <meta name="twitter:image" content="${imageUrl}">
        <meta name="twitter:url" content="${cardUrl}">
        
        <!-- Open Graph metadata -->
        <meta property="og:url" content="${cardUrl}">
        <meta property="og:type" content="website">
        <meta property="og:title" content="${card.title || '&emsp;'}">
        <meta property="og:description" content="${card.description || 'Click to visit the link'}">
        <meta property="og:image" content="${imageUrl}">
        
        <title>${card.title || 'Lynx Card'} - Lynx</title>
        
        <!-- Instant redirect for human visitors -->
        <script>
          // Check if this is a bot/crawler
          const userAgent = navigator.userAgent.toLowerCase();
          const isBot = /bot|crawler|spider|crawling|facebook|twitter|linkedin|whatsapp|telegram|slack|discord/i.test(userAgent);
          
          if (!isBot) {
            // Instant redirect for human visitors
            window.location.replace('${card.targetUrl}');
          }
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
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <img src="${imageUrl}" alt="${card.title || ''}" class="card-image">
          <div class="card-content">
            <h1 class="card-title">${card.title || '&emsp;'}</h1>
            <p class="card-description">${card.description || 'Click to visit the link'}</p>
            <div class="redirect-message">
              <div class="spinner"></div>
              Redirecting you to the destination...
            </div>
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
