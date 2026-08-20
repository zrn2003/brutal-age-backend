import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import Listing from './models/Listing.js';

dotenv.config();

const sampleListings = [
  {
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
    contact_link: 'https://wa.me/919876543210',
  },
  {
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
    contact_link: 'https://wa.me/919876543210',
  },
  {
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
    contact_link: 'https://wa.me/919876543210',
  },
  {
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
    contact_link: 'https://wa.me/919876543210',
  },
  {
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
    contact_link: 'https://wa.me/919876543210',
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas for seeding...');

    // Seed Admin
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';

    await Admin.deleteMany({});
    const admin = new Admin({ username, password });
    await admin.save();
    console.log(`Admin user created in MongoDB Atlas: username="${username}", password="${password}"`);

    // Seed Sample Listings
    await Listing.deleteMany({});
    await Listing.insertMany(sampleListings);
    console.log(`Successfully seeded ${sampleListings.length} Brutal Age listings into MongoDB Atlas!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
