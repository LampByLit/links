import express from 'express';
import { PrismaClient } from '@prisma/client';
import { viewRateLimit } from '../middleware/rateLimit';

const prisma = new PrismaClient();
const router = express.Router();

// Display all generated links
router.get('/', viewRateLimit, async (req, res) => {
  try {
    // Get all cards from database, ordered by creation date (newest first)
    const cards = await prisma.card.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        slug: true,
        targetUrl: true,
        title: true,
        createdAt: true,
        clickCount: true
      }
    });

    // Get the base URL for constructing full links
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Generate HTML page
    const linksHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>All Generated Links - Lynx</title>
        <link rel="icon" type="image/png" href="/images/favicon.png">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { font-family: 'Inter', sans-serif; }
          .url-cell { 
            max-width: 0; 
            width: 40%; 
            word-break: break-all; 
          }
          .card-link-cell { 
            max-width: 0; 
            width: 30%; 
            word-break: break-all; 
          }
          .table-container { 
            overflow-x: auto; 
          }
        </style>
      </head>
      <body class="bg-gray-50 min-h-screen">
        <div class="w-full py-8 px-4">
          <!-- Header -->
          <div class="text-center mb-8">
            <a href="https://lampbylit.com" target="_blank" rel="noopener noreferrer" class="inline-block hover:opacity-80 transition-opacity mb-4">
              <img src="/images/logo.png" alt="&amp Logo" class="h-12 w-auto mx-auto">
            </a>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">All Generated Links</h1>
            <p class="text-gray-600">Total: ${cards.length} links generated</p>
            <a href="/" class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Create New Link
            </a>
          </div>

          <!-- Links Table -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-900">Generated Links</h2>
            </div>
            
            ${cards.length === 0 ? `
              <div class="px-6 py-12 text-center">
                <p class="text-gray-500 text-lg">No links generated yet.</p>
                <a href="/" class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Create Your First Link
                </a>
              </div>
            ` : `
              <div class="table-container">
                <table class="w-full table-fixed">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Card Link</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">Destination URL</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Clicks</th>
                      <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Created</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    ${cards.map(card => `
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-4 card-link-cell">
                          <a href="${baseUrl}/${card.slug}" target="_blank" class="text-blue-600 hover:text-blue-800 font-mono text-xs break-all">
                            ${baseUrl}/${card.slug}
                          </a>
                        </td>
                        <td class="px-4 py-4 url-cell">
                          <a href="${card.targetUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 text-xs break-all">
                            ${card.targetUrl}
                          </a>
                        </td>
                        <td class="px-4 py-4 text-sm text-gray-900 text-center">
                          ${card.clickCount}
                        </td>
                        <td class="px-4 py-4 text-xs text-gray-500">
                          ${new Date(card.createdAt).toLocaleDateString()}<br>${new Date(card.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>

        </div>

        <!-- No JavaScript needed for this page -->
      </body>
      </html>
    `;

    res.send(linksHtml);

  } catch (error) {
    console.error('Links page error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - Lynx</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        <h1>Something went wrong</h1>
        <p>We encountered an error while loading the links page.</p>
        <a href="/">Go back home</a>
      </body>
      </html>
    `);
  }
});

export default router;
