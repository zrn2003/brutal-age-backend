import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Account title is required'],
      trim: true,
    },
    game_name: {
      type: String,
      required: [true, 'Game name is required'],
      default: 'Brutal Age',
    },
    images: {
      type: [String],
      default: [],
    },
    rank: {
      type: String,
      default: 'N/A',
      trim: true,
    },
    level: {
      type: String,
      default: '1',
      trim: true,
    },
    resources: {
      type: String,
      default: '',
      trim: true,
    },
    login_details_note: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Sold', 'Reserved'],
      default: 'Available',
    },
    contact_link: {
      type: String,
      default: '',
      trim: true,
    },
    posted_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for high-speed query performance & indexed sorting
listingSchema.index({ createdAt: -1 });
listingSchema.index({ game_name: 1, status: 1, price: 1, createdAt: -1 });

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
