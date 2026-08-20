import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// 1. Helmet HTTP Security Header Policy
export const helmetSecurityMiddleware = helmet({
  contentSecurityPolicy: false, // Allowed for cross-origin image loading
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
});

const isLocalIp = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip.includes('127.0.0.1');
};

// 2. Anti-DDoS General API Rate Limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== 'production' || isLocalIp(req),
  message: {
    status: 429,
    message: 'Too many requests from this IP address, please try again after 15 minutes.',
  },
});

// 3. Buyer Account Brute-Force Protection Limiter (5-minute lock on 5 failed attempts)
export const buyerAuthLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes block window
  max: 5, // Limit 5 login attempts per 5 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  // Never block admin authentication routes or local dev IPs
  skip: (req) => {
    const isAdminRoute = req.originalUrl === '/api/auth/login' || req.originalUrl === '/api/auth/me';
    return isAdminRoute || isLocalIp(req);
  },
  message: {
    status: 429,
    message: 'Too many failed login attempts. Your IP has been temporarily locked for 5 minutes for cyber protection.',
  },
});

// 4. File Upload Rate Limiter
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== 'production' || isLocalIp(req),
  message: {
    status: 429,
    message: 'Upload rate limit exceeded. Please wait before uploading more high-res images.',
  },
});
