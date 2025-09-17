import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import uploadRouter from './routes/upload';
import cardsRouter from './routes/cards';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://cdn.tailwindcss.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('data/uploads'));

// Basic health check (must come before catch-all routes)
app.get('/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.status(200).send('OK');
});

// API Routes
app.use('/api', uploadRouter);

// Card pages (must come before the catch-all route)
app.use('/', cardsRouter);

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Initialize SQLite database on startup
try {
  console.log('📊 Initializing SQLite database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ SQLite database initialized successfully');
} catch (error) {
  console.error('❌ Database initialization failed:', error);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Lynx server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Server bound to: 0.0.0.0:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Railway URL: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'Not set'}`);
  console.log(`🔧 PORT from env: ${process.env.PORT}`);
  console.log(`🔧 All env vars: ${Object.keys(process.env).filter(k => k.includes('PORT') || k.includes('RAILWAY')).join(', ')}`);
});
