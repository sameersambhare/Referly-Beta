import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  businessId: mongoose.Types.ObjectId;
  date: Date;
  referralCount: number;
  clickCount: number;
  conversionCount: number;
  conversionRate: number;
  rewardsPaid: number;
  campaignId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSchema = new Schema<IAnalytics>(
  {
    businessId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    date: { type: Date, required: true },
    referralCount: { type: Number, default: 0 },
    clickCount: { type: Number, default: 0 },
    conversionCount: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    rewardsPaid: { type: Number, default: 0 },
    campaignId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Campaign' 
    },
  },
  { timestamps: true }
);

// Create a compound index for business and date to ensure uniqueness
AnalyticsSchema.index({ businessId: 1, date: 1, campaignId: 1 }, { unique: true });

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema); 