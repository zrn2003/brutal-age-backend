import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protectAdmin = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Support development fallback token if admin user exists
      if (token === 'demo_admin_jwt_token_2026') {
        const admin = await Admin.findOne({});
        if (admin) {
          req.admin = admin;
          return next();
        }
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_brutal_age_jwt_key_2026'
      );

      req.admin = await Admin.findById(decoded.id).select('-password');
      if (!req.admin) {
        return res.status(401).json({ message: 'Admin account not found' });
      }
      return next();
    } catch (error) {
      console.error('Admin Auth Middleware Error:', error.message);
      return res.status(401).json({ message: 'Not authorized, admin token verification failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
