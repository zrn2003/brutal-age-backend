import express from 'express';
import Analytics from '../models/Analytics.js';
import Buyer from '../models/Buyer.js';
import Listing from '../models/Listing.js';
import Requirement from '../models/Requirement.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to get or create analytics document
const getOrInitAnalytics = async () => {
  let doc = await Analytics.findOne();
  if (!doc) {
    doc = new Analytics({ totalVisits: 1, uniqueVisitors: 1, activeSessions: 1 });
    await doc.save();
  }
  return doc;
};

// @route   POST /api/analytics/visit
// @desc    Track website page visit
// @access  Public
router.post('/visit', async (req, res) => {
  try {
    const doc = await getOrInitAnalytics();
    doc.totalVisits += 1;
    doc.lastVisitedAt = new Date();
    await doc.save();
    res.json({ totalVisits: doc.totalVisits, activeSessions: doc.activeSessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/analytics
// @desc    Get full dashboard analytics board (Admin)
// @access  Private (Admin)
router.get('/', protectAdmin, async (req, res) => {
  try {
    const doc = await getOrInitAnalytics();
    const totalBuyersCount = await Buyer.countDocuments();
    const totalListingsCount = await Listing.countDocuments();
    const totalRequirementsCount = await Requirement.countDocuments();
    const availableListings = await Listing.countDocuments({ status: 'Available' });
    const soldListings = await Listing.countDocuments({ status: 'Sold' });

    res.json({
      totalVisits: doc.totalVisits,
      uniqueVisitors: doc.uniqueVisitors || doc.totalVisits,
      activeSessions: doc.activeSessions || 1,
      lastVisitedAt: doc.lastVisitedAt,
      registeredBuyersCount: totalBuyersCount,
      totalListingsCount,
      availableListings,
      soldListings,
      totalRequirementsCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
