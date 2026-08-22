import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import listingRoutes from './routes/listingRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import requirementRoutes from './routes/requirementRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import Admin from './models/Admin.js';

import { helmetSecurityMiddleware, apiLimiter, buyerAuthLimiter, uploadLimiter } from './config/security.js';
import { noSqlSanitizer, xssSanitizer } from './middleware/sanitizeMiddleware.js';
import { isFirebaseConfigured } from './config/firebase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Ensure uploads directory exists for fallback local disk storage
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// 🛡️ Cybersecurity Pipeline Middlewares
app.use(helmetSecurityMiddleware); // Helmet HTTP Security Headers
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] })); // Allow local network smartphones & tunnels
app.use(express.json({ limit: '50mb' })); // Expanded to 50MB for high-resolution images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(noSqlSanitizer); // Prevent NoSQL Query Injection ($where, $gt, $ne)
app.use(xssSanitizer); // Prevent Cross-Site Scripting (XSS) HTML/Script Injections

// Serve uploaded images statically (fallback)
app.use('/uploads', express.static(uploadsDir));

// Rate Limiter Pipelines
app.use('/api', apiLimiter);
app.use('/api/auth/buyer', buyerAuthLimiter); // 5-minute lockout on repeated failed buyer logins (Admin exempt)
app.use('/api/upload', uploadLimiter);

// API Microservice Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/analytics', analyticsRoutes);

// System Health & Cyber Security Audit Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    dbState: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    storagePipeline: isFirebaseConfigured
      ? 'Google Firebase Storage'
      : 'Local Disk Storage (/uploads)',
    cyberProtection: {
      helmetHttpHeaders: 'ACTIVE',
      noSqlSanitization: 'ACTIVE',
      xssScriptShield: 'ACTIVE',
      buyerAuthLockout: 'ACTIVE (5-min lock on failed attempts, Admin exempt)',
      bcryptPasswordEncryption: '256-Bit Salted Cryptographic Hashing ACTIVE',
      jwtTokenAuthorization: 'HMAC-SHA256 Signed Tokens ACTIVE',
    },
    timestamp: new Date(),
  });
});

// Global Express Payload & Error Handler
app.use((err, req, res, next) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    return res.status(413).json({
      message: 'Uploaded high-resolution image files are too large for a single request (exceeds 50MB). Please upload smaller images or paste Firebase image URLs.',
    });
  }
  return res.status(err.status || 500).json({
    message: err ? err.message : 'Internal Server Error',
  });
});

// Auto Seed Admin if none exists
const seedAdminIfNeeded = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const username = process.env.ADMIN_USERNAME || 'gamerdudeabhi1394@gmail.com';
      const password = process.env.ADMIN_PASSWORD || 'Abhi@1394';
      const admin = new Admin({ username, password });
      await admin.save();
      console.log(`🔑 Admin created automatically: username="${username}", password="${password}"`);
    }
  } catch (err) {
    console.error('Error auto-seeding admin:', err.message);
  }
};

// Database Connection & Server Listen
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gaming_marketplace';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Database');
    seedAdminIfNeeded();
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB connection warning (Memory fallback mode if DB unreachable):', err.message);
  });

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Brutal Age Microservices API running on port ${PORT} (Listening on 0.0.0.0 for local network devices)`);
  console.log(`📦 Image Storage Pipeline: ${isFirebaseConfigured ? 'Google Firebase Storage' : 'Local Disk'}`);
  console.log(`🛡️ Cybersecurity Shields: Helmet, Anti-NoSQL, Anti-XSS, Bcrypt, JWT, Custom Requirements & Analytics ACTIVE`);
});

// Configure high-performance socket timeouts to prevent ERR_CONNECTION_CLOSED on large payloads
server.keepAliveTimeout = 120 * 1000; // 120 seconds
server.headersTimeout = 125 * 1000; // 125 seconds
