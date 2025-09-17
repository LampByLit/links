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
        </style>
      </head>
      <body class="bg-gray-50 min-h-screen">
        <div class="max-w-4xl mx-auto py-8 px-4">
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
              <div class="w-full">
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lynx Link</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination URL</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    ${cards.map(card => `
                      <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4">
                          <div class="flex items-center">
                            <a href="${baseUrl}/${card.slug}" target="_blank" class="text-blue-600 hover:text-blue-800 font-mono text-sm">
                              ${baseUrl}/${card.slug}
                            </a>
                            <button 
                              onclick="copyToClipboard('${baseUrl}/${card.slug}')"
                              class="ml-2 p-1 text-gray-400 hover:text-gray-600"
                              title="Copy link"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td class="px-6 py-4">
                          <a href="${card.targetUrl}" target="_blank" class="text-blue-600 hover:text-blue-800 text-sm">
                            ${card.targetUrl}
                          </a>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-900">
                          ${card.clickCount}
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-500">
                          ${new Date(card.createdAt).toLocaleDateString()} ${new Date(card.createdAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>

          <!-- Footer -->
          <div class="text-center mt-8 text-sm text-gray-500">
            <p>Powered by <a href="https://lampbylit.com" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800">LampByLit</a></p>
          </div>
        </div>

        <script>
          function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(function() {
              // Show a prominent success animation
              const button = event.target.closest('button');
              const originalHTML = button.innerHTML;
              
              // Create a more visible success state
              button.innerHTML = '<svg class="w-4 h-4 text-green-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>';
              button.classList.add('bg-green-100', 'border-green-300');
              
              // Add a toast notification
              showToast('Link copied to clipboard!');
              
              setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove('bg-green-100', 'border-green-300');
              }, 2000);
            }).catch(function(err) {
              console.error('Could not copy text: ', err);
              showToast('Failed to copy link', 'error');
            });
          }
          
          function showToast(message, type = 'success') {
            // Remove existing toast if any
            const existingToast = document.getElementById('toast');
            if (existingToast) {
              existingToast.remove();
            }
            
            // Create toast element
            const toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg text-white font-medium transform transition-all duration-300 ' + 
              (type === 'success' ? 'bg-green-500' : 'bg-red-500');
            toast.textContent = message;
            
            // Add to page
            document.body.appendChild(toast);
            
            // Animate in
            setTimeout(() => {
              toast.classList.add('translate-x-0', 'opacity-100');
            }, 10);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
              toast.classList.add('translate-x-full', 'opacity-0');
              setTimeout(() => {
                if (toast.parentNode) {
                  toast.remove();
                }
              }, 300);
            }, 3000);
          }
        </script>
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
