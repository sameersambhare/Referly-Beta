import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  rewardType: 'cash' | 'discount' | 'gift' | 'points';
  rewardAmount: number;
  rewardDescription?: string;
  targetAudience?: string;
  conversionCriteria?: string;
  landingPageUrl?: string;
  customMessage?: string;
  referralCount: number;
  conversionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    businessId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    rewardType: { 
      type: String, 
      enum: ['cash', 'discount', 'gift', 'points'], 
      required: true 
    },
    rewardAmount: { type: Number, required: true },
    rewardDescription: { type: String },
    targetAudience: { type: String },
    conversionCriteria: { type: String },
    landingPageUrl: { type: String },
    customMessage: { type: String },
    referralCount: { type: Number, default: 0 },
    conversionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema); 