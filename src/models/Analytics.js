import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema(
  {
    totalVisits: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    activeSessions: {
      type: Number,
      default: 1,
    },
    lastVisitedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Analytics', analyticsSchema);
