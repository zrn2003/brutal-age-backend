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

const fallbackListings = [
  {
    _id: '6a86ee29dbacb7c39c9c8c50',
    title: 'Brutal Age strong hold 35 Account + T7 Horde Troops Unlocked',
    game_name: 'Brutal Age',
    images: [
      '/assets/01.png',
      '/assets/02.png',
      '/assets/03.png',
    ],
    rank: 'POWERFUL ACCOUNTS / T7 Horde Troops',
    level: 'Leadership LEVEL 350',
    resources: '250M Wood & Mana | resource service | clan coin service | account/partner service',
    login_details_note: 'Single Email + Game Center Linked (Clean Transfer)',
    price: 1850,
    description: 'Top-tier Brutal Age war account with strong hold 35, full T7 Horde troops unlocked, maxed Red Dragon skills, and 35k gems stored.',
    status: 'Available',
    contact_link: 'https://wa.me/917517491313',
  },
  {
    _id: '6a86ee29dbacb7c39c9c8c51',
    title: 'Brutal Age Kingdom #420 Lord ID — POWERFUL ACCOUNTS & LEGENDARY PARTNER SET',
    game_name: 'Brutal Age',
    images: [
      '/assets/02.png',
      '/assets/01.png',
      '/assets/03.png',
    ],
    rank: 'POWERFUL ACCOUNTS / T7 Horde',
    level: 'Leadership LEVEL 280',
    resources: '120M Resources | resource service | clan coin service',
    login_details_note: 'Original Gmail Included (Full Direct Access)',
    price: 1250,
    description: 'High offensive power Brutal Age account with strong hold 35, full LEGENDARY PARTNER SET, and high rally speed stats.',
    status: 'Available',
    contact_link: 'https://wa.me/917517491313',
  },
  {
    _id: '6a86ee29dbacb7c39c9c8c52',
    title: 'Brutal Age Max War Account — POWERFUL ACCOUNTS & T7 Horde (RESERVED)',
    game_name: 'Brutal Age',
    images: [
      '/assets/03.png',
      '/assets/01.png',
    ],
    rank: 'POWERFUL ACCOUNTS / T7 Horde',
    level: 'Leadership LEVEL 500',
    resources: '500M Resources | account/partner service | clan coin service',
    login_details_note: 'Facebook Linked',
    price: 3200,
    description: 'Dominant server war leader account with maxed out T7 Horde troops and Golden Dragon unlocked.',
    status: 'Reserved',
    contact_link: 'https://wa.me/917517491313',
  },
  {
    _id: '6a86ee29dbacb7c39c9c8c53',
    title: 'Brutal Age Starter strong hold 35 Account + 50M Resource Stash',
    game_name: 'Brutal Age',
    images: [
      '/assets/01.png',
      '/assets/03.png',
    ],
    rank: 'POWERFUL ACCOUNTS / T7 Horde Troops',
    level: 'Leadership LEVEL 150',
    resources: '50M Wood/Mana | resource service | clan coin service',
    login_details_note: 'Clean Google Login (Instant Handover)',
    price: 650,
    description: 'Great mid-game Brutal Age account with strong hold 35 unlocked, clean research tree, and ready for kingdom teleport.',
    status: 'Available',
    contact_link: 'https://wa.me/917517491313',
  },
  {
    _id: '6a86ee29dbacb7c39c9c8c54',
    title: 'Brutal Age Veteran Account — Leadership LEVEL 420 & Blue Dragon Skills',
    game_name: 'Brutal Age',
    images: [
      '/assets/02.png',
      '/assets/03.png',
    ],
    rank: 'POWERFUL ACCOUNTS / T7 Horde',
    level: 'Leadership LEVEL 420',
    resources: '180M Resources | resource service | account/partner service',
    login_details_note: 'Twitter + Mail Linked',
    price: 1950,
    description: 'Strong clan leader account with strong hold 35, maxed Blue Dragon frost skills, and high defense research.',
    status: 'Available',
    contact_link: 'https://wa.me/917517491313',
  },
];

// @route   GET /api/listings
// @desc    Get public account listings with filtering & search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const listings = await getListingsService(req.query || {});
    if (Array.isArray(listings) && listings.length > 0) {
      return res.json(listings);
    }
    return res.json(fallbackListings);
  } catch (error) {
    console.error('[GET LISTINGS ROUTE ERROR]:', error.message);
    return res.json(fallbackListings);
  }
});

// @route   GET /api/listings/:id
// @desc    Get single account listing details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const listing = await getListingByIdService(req.params.id);
    if (!listing) {
      const fallback = fallbackListings.find(f => f._id === req.params.id);
      if (fallback) return res.json(fallback);
      return res.status(404).json({ message: 'Account listing not found' });
    }
    res.json(listing);
  } catch (error) {
    console.error('[GET LISTING BY ID ERROR]:', error.message);
    const fallback = fallbackListings.find(f => f._id === req.params.id);
    if (fallback) return res.json(fallback);
    res.status(404).json({ message: 'Listing not found' });
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
