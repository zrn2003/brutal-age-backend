import Listing from '../models/Listing.js';

export const getListingsService = async (queryParams) => {
  const { game, rank, status, minPrice, maxPrice, search } = queryParams;

  let query = {};

  if (game && game !== 'All') {
    query.game_name = game;
  }

  if (status && status !== 'All') {
    query.status = status;
  }

  if (rank) {
    query.rank = { $regex: rank, $options: 'i' };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { resources: { $regex: search, $options: 'i' } },
      { level: { $regex: search, $options: 'i' } },
    ];
  }

  return await Listing.find(query).sort({ createdAt: -1 });
};

export const getListingByIdService = async (id) => {
  return await Listing.findById(id);
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
