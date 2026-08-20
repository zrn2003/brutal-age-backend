import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Buyer from '../models/Buyer.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const generateToken = (id, role = 'admin') => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'super_secret_brutal_age_jwt_key_2026',
    { expiresIn: '7d' }
  );
};

// ==========================================
// 1. STORE ADMIN AUTHENTICATION
// ==========================================

// @route   POST /api/auth/login
// @desc    Admin login & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Username and password required as valid strings' });
    }

    const admin = await Admin.findOne({ username });
    if (admin && (await admin.comparePassword(password))) {
      return res.json({
        _id: admin._id,
        username: admin.username,
        token: generateToken(admin._id, 'admin'),
      });
    } else {
      return res.status(401).json({ message: 'Invalid admin username or password' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in admin session
// @access  Private (Admin)
router.get('/me', protectAdmin, (req, res) => {
  res.json({
    _id: req.admin._id,
    username: req.admin.username,
  });
});

// ==========================================
// 2. BUYER ACCOUNT REGISTER & LOGIN
// ==========================================

// @route   POST /api/auth/buyer/register
// @desc    Register a new buyer account in MongoDB
// @access  Public
router.post('/buyer/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Name, email, and password are required valid fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingBuyer = await Buyer.findOne({ email: email.toLowerCase() });
    if (existingBuyer) {
      return res.status(400).json({ message: 'An account with this email address already exists. Please sign in instead.' });
    }

    const newBuyer = new Buyer({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
    });

    const savedBuyer = await newBuyer.save();
    const token = generateToken(savedBuyer._id, 'buyer');

    return res.status(201).json({
      id: savedBuyer._id.toString(),
      name: savedBuyer.name,
      email: savedBuyer.email,
      phone: savedBuyer.phone,
      token,
      message: 'Buyer registration successful!',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/buyer/login
// @desc    Authenticate buyer & return session token
// @access  Public
router.post('/buyer/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Email and password are required valid text strings.' });
    }

    const buyer = await Buyer.findOne({ email: email.toLowerCase() });
    if (buyer && (await buyer.comparePassword(password))) {
      const token = generateToken(buyer._id, 'buyer');
      return res.json({
        id: buyer._id.toString(),
        name: buyer.name,
        email: buyer.email,
        phone: buyer.phone,
        token,
        message: 'Buyer login successful!',
      });
    } else {
      return res.status(401).json({ message: 'Invalid email address or password.' });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/buyers
// @desc    Get all registered buyer users (Name + Email + Phone)
// @access  Private (Admin)
router.get('/buyers', protectAdmin, async (req, res) => {
  try {
    const buyers = await Buyer.find({}, '-password').sort({ createdAt: -1 });
    return res.json(buyers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;
