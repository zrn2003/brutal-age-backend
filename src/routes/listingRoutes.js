import express from 'express';
import { protectAdmin } from '../middleware/authMiddleware.js';
import {
  getListingsService,
  getListingByIdService,
  createListingService,
  updateListingService,
  deleteListingService,
} from '../services/listingService.js';

const router = express.Router();

// @route   GET /api/listings
// @desc    Get public account listings with filtering & search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const listings = await getListingsService(req.query);
    res.json(listings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/listings/:id
// @desc    Get single account listing details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const listing = await getListingByIdService(req.params.id);
    if (!listing) {
      return res.status(404).json({ message: 'Account listing not found' });
    }
    res.json(listing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/listings
// @desc    Create a new account listing in MongoDB
// @access  Private (Admin)
router.post('/', protectAdmin, async (req, res) => {
  try {
    const createdListing = await createListingService(req.body);
    res.status(201).json(createdListing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/listings/:id
// @desc    Update existing listing details in MongoDB
// @access  Private (Admin)
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const updatedListing = await updateListingService(req.params.id, req.body);
    if (!updatedListing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json(updatedListing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/listings/:id
// @desc    Delete account listing from MongoDB
// @access  Private (Admin)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const deleted = await deleteListingService(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
