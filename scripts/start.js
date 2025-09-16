const { execSync } = require('child_process');

async function startApp() {
  try {
    console.log('🚀 Starting Lynx application...');
    
    // Initialize database if needed
    console.log('📊 Initializing database...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database initialized successfully');
    
    // Start the application
    console.log('🎯 Starting server...');
    execSync('node dist/app.js', { stdio: 'inherit' });
    
  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

startApp();
