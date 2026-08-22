import mongoose from 'mongoose';
import Listing from '../models/Listing.js';

const sampleListings = [
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

export const getListingsService = async (queryParams = {}) => {
  try {
    const safeParams = queryParams || {};
    const { game, rank, status, minPrice, maxPrice, search } = safeParams;

    let query = {};

    if (game && typeof game === 'string' && game !== 'All') {
      query.game_name = game;
    }

    if (status && typeof status === 'string' && status !== 'All') {
      query.status = status;
    }

    if (rank && typeof rank === 'string' && rank.trim() !== '') {
      query.rank = { $regex: rank.trim(), $options: 'i' };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice && !isNaN(Number(minPrice))) query.price.$gte = Number(minPrice);
      if (maxPrice && !isNaN(Number(maxPrice))) query.price.$lte = Number(maxPrice);
      if (Object.keys(query.price).length === 0) {
        delete query.price;
      }
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const cleanSearch = search.trim();
      query.$or = [
        { title: { $regex: cleanSearch, $options: 'i' } },
        { description: { $regex: cleanSearch, $options: 'i' } },
        { resources: { $regex: cleanSearch, $options: 'i' } },
        { level: { $regex: cleanSearch, $options: 'i' } },
      ];
    }

    let listings = await Listing.find(query).sort({ createdAt: -1 }).allowDiskUse(true);

    // Fallback 1: If query with filters returns 0 items, fetch all listings from database
    if ((!listings || listings.length === 0) && Object.keys(query).length > 0) {
      listings = await Listing.find({}).sort({ createdAt: -1 }).allowDiskUse(true);
    }

    // Fallback 2: If database collection has 0 items, auto-seed initial listings
    if (!listings || listings.length === 0) {
      try {
        const totalCount = await Listing.countDocuments();
        if (totalCount === 0) {
          console.log('[AUTO-SEED] Seeding initial listings into database...');
          await Listing.insertMany(sampleListings);
          listings = await Listing.find({}).sort({ createdAt: -1 }).allowDiskUse(true);
        }
      } catch (seedErr) {
        console.error('[AUTO-SEED ERROR]:', seedErr.message);
      }
    }

    // Fallback 3: Return sampleListings if database returned nothing
    if (!listings || listings.length === 0) {
      return sampleListings;
    }

    return listings;
  } catch (err) {
    console.error('Error inside getListingsService:', err);
    return sampleListings;
  }
};

export const getListingByIdService = async (id) => {
  try {
    if (!id || typeof id !== 'string') return null;

    // 1. Full 24-character ObjectId match
    if (mongoose.Types.ObjectId.isValid(id)) {
      const listing = await Listing.findById(id);
      if (listing) return listing;
    }

    // 2. Short 6-character suffix match (e.g. "1b29a1")
    const cleanId = id.replace(/[^a-fA-F0-9]/g, '');
    if (cleanId.length >= 4) {
      const shortListing = await Listing.findOne({
        _id: { $regex: `${cleanId}$`, $options: 'i' },
      });
      if (shortListing) return shortListing;
    }

    // 3. Fallback match inside sampleListings
    const sample = sampleListings.find(s => s._id === id || s._id.endsWith(cleanId));
    if (sample) return sample;

    return null;
  } catch (err) {
    console.error('Error inside getListingByIdService:', err);
    return null;
  }
};

export const createListingService = async (listingData) => {
  const newListing = new Listing({
    title: listingData.title,
    game_name: listingData.game_name || 'Brutal Age',
    images: listingData.images || [],
    rank: listingData.rank,
    level: listingData.level,
    resources: listingData.resources,
    login_details_note: listingData.login_details_note,
    price: listingData.price,
    description: listingData.description,
    status: listingData.status || 'Available',
    contact_link: listingData.contact_link,
  });

  return await newListing.save();
};

export const updateListingService = async (id, updateData) => {
  const listing = await Listing.findById(id);
  if (!listing) return null;

  const allowedFields = [
    'title',
    'game_name',
    'images',
    'rank',
    'level',
    'resources',
    'login_details_note',
    'price',
    'description',
    'status',
    'contact_link',
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      listing[field] = updateData[field];
    }
  });

  return await listing.save();
};

export const deleteListingService = async (id) => {
  const listing = await Listing.findById(id);
  if (!listing) return false;

  await listing.deleteOne();
  return true;
};
