import express from 'express';
import Requirement from '../models/Requirement.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/requirements
// @desc    Submit a custom account requirement (Public)
// @access  Public
router.post('/', async (req, res) => {
  try {
    const {
      buyerName,
      buyerEmail,
      buyerPhone,
      desiredLeadership,
      relocationTickets,
      budgetUSD,
      preferredContactChannel,
      contactDetail,
      additionalNotes,
    } = req.body;

    if (!buyerName || !buyerEmail || !desiredLeadership || !budgetUSD) {
      return res.status(400).json({ message: 'Buyer name, email, desired leadership level, and budget are required.' });
    }

    const newReq = new Requirement({
      buyerName,
      buyerEmail,
      buyerPhone: buyerPhone || '',
      desiredLeadership,
      relocationTickets: relocationTickets || '',
      budgetUSD: Number(budgetUSD),
      preferredContactChannel: preferredContactChannel || 'WhatsApp',
      contactDetail: contactDetail || '',
      additionalNotes: additionalNotes || '',
    });

    const saved = await newReq.save();
    res.status(201).json({ message: 'Custom requirement submitted successfully!', requirement: saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/requirements
// @desc    Get all custom account requirements (Admin)
// @access  Private (Admin)
router.get('/', protectAdmin, async (req, res) => {
  try {
    const requirements = await Requirement.find().sort({ createdAt: -1 });
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/requirements/:id
// @desc    Update requirement status (Admin)
// @access  Private (Admin)
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const reqItem = await Requirement.findById(req.params.id);
    if (!reqItem) {
      return res.status(404).json({ message: 'Requirement request not found.' });
    }

    if (status) reqItem.status = status;
    const updated = await reqItem.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/requirements/:id
// @desc    Delete custom requirement (Admin)
// @access  Private (Admin)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const reqItem = await Requirement.findById(req.params.id);
    if (!reqItem) {
      return res.status(404).json({ message: 'Requirement request not found.' });
    }

    await reqItem.deleteOne();
    res.json({ message: 'Requirement deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
