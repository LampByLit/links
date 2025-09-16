import rateLimit from 'express-rate-limit';

// Rate limiting for upload endpoint
export const uploadRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'), // 5 requests per window default
  message: {
    error: 'Too many upload requests. Please wait before creating another card.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '120000') / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health',
  // Custom key generator to use IP + User-Agent for better uniqueness
  keyGenerator: (req) => {
    return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
  }
});

// Rate limiting for card page views (more lenient)
export const viewRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',
  keyGenerator: (req) => {
    return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
  }
});
