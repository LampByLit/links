const { execSync, spawn } = require('child_process');
const path = require('path');

// Load environment variables, but don't override existing ones (Railway takes precedence)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function startApp() {
  try {
    console.log('🚀 Starting Lynx application...');
    
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable not found');
      console.log('Available environment variables:', Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('POSTGRES')));
      process.exit(1);
    }
    
    console.log('📊 DATABASE_URL found:', process.env.DATABASE_URL.substring(0, 20) + '...');
    console.log('📊 All database-related env vars:', Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('POSTGRES')));
    
    // Check if we're using SQLite instead of PostgreSQL
    if (process.env.DATABASE_URL.startsWith('file:')) {
      console.log('⚠️  Using SQLite instead of PostgreSQL');
      console.log('⚠️  Railway PostgreSQL service not connected - using local SQLite');
      console.log('📊 To fix: Connect PostgreSQL service in Railway dashboard');
    }
    
    // Initialize database if needed
    console.log('📊 Initializing database...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database initialized successfully');
    
    // Start the application using spawn instead of execSync
    console.log('🎯 Starting server...');
    const server = spawn('node', ['dist/app.js'], {
      stdio: 'inherit',
      env: process.env
    });
    
    // Handle server process events
    server.on('error', (error) => {
      console.error('❌ Server failed to start:', error);
      process.exit(1);
    });
    
    server.on('exit', (code, signal) => {
      console.log(`🛑 Server exited with code ${code} and signal ${signal}`);
      process.exit(code || 0);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🛑 Received SIGTERM, shutting down gracefully...');
      server.kill('SIGTERM');
    });
    
    process.on('SIGINT', () => {
      console.log('🛑 Received SIGINT, shutting down gracefully...');
      server.kill('SIGINT');
    });
    
  } catch (error) {
    console.error('❌ Startup failed:', error);
    process.exit(1);
  }
}

startApp();
