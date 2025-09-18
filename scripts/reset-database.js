const { execSync } = require('child_process');
const fs = require('fs');

console.log('🗑️  Resetting database to match current schema...');

// Database path
const dbPath = process.env.DATABASE_URL?.replace('file:', '') || './prisma/dev.db';
console.log(`📍 Database path: ${dbPath}`);

// Delete existing database if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('✅ Deleted existing database');
}

// Recreate database with current schema
try {
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  console.log('✅ Database recreated with current schema');
} catch (error) {
  console.error('❌ Failed to reset database:', error.message);
  process.exit(1);
}

console.log('🎉 Database reset complete!');
