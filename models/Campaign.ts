import { Schema, model, models, Document, Types } from 'mongoose';

export interface ICampaign extends Document {
  businessId: Types.ObjectId; // The business that created this campaign
  companyName: string; // Name of the company (for easier querying)
  name: string; // Name of the campaign
  description?: string; // Description of the campaign
  startDate: Date; // When the campaign starts
  endDate?: Date; // When the campaign ends (optional)
  isActive: boolean; // Whether the campaign is currently active
  
  // Customer reward details
  rewardType: 'cash' | 'discount' | 'gift' | 'points'; // Type of reward for customers
  rewardAmount: number; // Amount of the reward for customers
  rewardDescription?: string; // Description of the customer reward
  
  // Referrer reward details
  referrerRewardType?: 'cash' | 'discount' | 'gift' | 'points'; // Type of reward for referrers
  referrerRewardAmount?: number; // Amount of the reward for referrers
  referrerRewardDescription?: string; // Description of the referrer reward
  
  // Campaign details
  targetAudience?: string; // Description of the target audience
  conversionCriteria?: string; // What constitutes a successful conversion
  landingPageUrl?: string; // URL of the landing page for this campaign
  customMessage?: string; // Custom message to include in referral emails
  
  // Campaign metrics
  referralCount: number; // Number of referrals made for this campaign
  conversionCount: number; // Number of successful conversions
  referrerCount: number; // Number of referrers participating in this campaign
  
  // Additional campaign settings
  referrerRequirements?: string; // Requirements for becoming a referrer
  sharingInstructions?: string; // Instructions for referrers on how to share
  
  // Campaign performance metrics
  metrics?: {
    impressions: number; // Number of times the campaign has been viewed
    clicks: number; // Number of clicks on referral links
    conversionRate: number; // Percentage of referrals that convert
    costPerAcquisition: number; // Average cost per acquisition
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Campaign Schema
const CampaignSchema = new Schema<ICampaign>(
  {
    businessId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    companyName: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
    
    // Customer reward details
    rewardType: { 
      type: String, 
      enum: ['cash', 'discount', 'gift', 'points'], 
      required: true 
    },
    rewardAmount: { type: Number, required: true },
    rewardDescription: { type: String },
    
    // Referrer reward details
    referrerRewardType: { 
      type: String, 
      enum: ['cash', 'discount', 'gift', 'points']
    },
    referrerRewardAmount: { type: Number },
    referrerRewardDescription: { type: String },
    
    // Campaign details
    targetAudience: { type: String },
    conversionCriteria: { type: String },
    landingPageUrl: { type: String },
    customMessage: { type: String },
    
    // Campaign metrics
    referralCount: { type: Number, default: 0 },
    conversionCount: { type: Number, default: 0 },
    referrerCount: { type: Number, default: 0 },
    
    // Additional campaign settings
    referrerRequirements: { type: String },
    sharingInstructions: { type: String },
    
    // Campaign performance metrics
    metrics: {
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      costPerAcquisition: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// Indexes for faster queries
CampaignSchema.index({ businessId: 1, isActive: 1 });
CampaignSchema.index({ companyName: 1 });
CampaignSchema.index({ startDate: 1, endDate: 1 });

// Create and export the Campaign model
export const Campaign = models.Campaign || model<ICampaign>('Campaign', CampaignSchema);

export default Campaign; 