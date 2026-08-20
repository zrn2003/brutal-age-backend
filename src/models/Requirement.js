import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema(
  {
    buyerName: {
      type: String,
      required: true,
      trim: true,
    },
    buyerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    buyerPhone: {
      type: String,
      default: '',
    },
    desiredLeadership: {
      type: String,
      required: true, // e.g. "300K - 500K"
    },
    relocationTickets: {
      type: String,
      default: '', // e.g. "15+ Relocation Tickets"
    },
    budgetUSD: {
      type: Number,
      required: true,
    },
    preferredContactChannel: {
      type: String,
      enum: ['WhatsApp', 'Line', 'Telegram', 'WeChat'],
      default: 'WhatsApp',
    },
    contactDetail: {
      type: String,
      default: '', // Phone number, Telegram handle, WeChat ID
    },
    additionalNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Fulfilled', 'Closed'],
      default: 'New',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Requirement', requirementSchema);
