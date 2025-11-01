const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixImageUrls() {
  console.log('🔧 Fixing image URLs in database...');
  
  try {
    // Find all cards with incorrect image URLs (missing /uploads/)
    const cardsToFix = await prisma.card.findMany({
      where: {
        imageUrl: {
          startsWith: '/processed-'
        }
      }
    });
    
    console.log(`Found ${cardsToFix.length} cards with incorrect image URLs`);
    
    // Update each card
    for (const card of cardsToFix) {
      const newImageUrl = `/uploads${card.imageUrl}`;
      
      await prisma.card.update({
        where: { id: card.id },
        data: { imageUrl: newImageUrl }
      });
      
      console.log(`✅ Fixed card ${card.slug}: ${card.imageUrl} → ${newImageUrl}`);
    }
    
    console.log('🎉 All image URLs fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing image URLs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImageUrls();
