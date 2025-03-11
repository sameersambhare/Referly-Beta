import { Schema, model, models, Document, Types } from 'mongoose';

export interface IAnalytics extends Document {
  businessId: Types.ObjectId; // The business these analytics are for
  companyName: string; // Name of the company (for easier querying)
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'; // Time period for these analytics
  date: Date; // Date these analytics are for
  
  // Overall metrics
  metrics: {
    totalReferrals: number; // Total number of referrals in this period
    successfulReferrals: number; // Number of successful referrals
    conversionRate: number; // Percentage of referrals that convert
    totalRewards: number; // Total value of rewards issued to customers
    totalReferrerRewards: number; // Total value of rewards issued to referrers
    averageRewardPerReferral: number; // Average reward per successful referral
    
    // Top performers
    topReferrers: {
      referrerId: Types.ObjectId; // Reference to the referrer
      name: string; // Name of the referrer
      referralCount: number; // Number of referrals made
      conversionCount: number; // Number of successful conversions
      rewardsEarned: number; // Total rewards earned
    }[];
    
    topCampaigns: {
      campaignId: Types.ObjectId; // Reference to the campaign
      name: string; // Name of the campaign
      referralCount: number; // Number of referrals made
      conversionCount: number; // Number of successful conversions
      conversionRate: number; // Percentage of referrals that convert
    }[];
    
    // Financial metrics
    customerAcquisitionCost: number; // Average cost to acquire a customer
    revenueGenerated: number; // Estimated revenue generated from referrals
    roi: number; // Return on investment for the referral program
  };
  
  // Campaign-specific performance
  campaignPerformance: {
    campaignId: Types.ObjectId; // Reference to the campaign
    name: string; // Name of the campaign
    impressions: number; // Number of times the campaign has been viewed
    clicks: number; // Number of clicks on referral links
    referrals: number; // Number of referrals made
    conversions: number; // Number of successful conversions
    conversionRate: number; // Percentage of referrals that convert
    rewardsIssued: number; // Total value of rewards issued
    referrerRewardsIssued: number; // Total value of referrer rewards issued
    roi: number; // Return on investment for this campaign
  }[];
  
  // Referrer-specific performance
  referrerPerformance: {
    referrerId: Types.ObjectId; // Reference to the referrer
    name: string; // Name of the referrer
    referralsGenerated: number; // Number of referrals made
    conversionsGenerated: number; // Number of successful conversions
    conversionRate: number; // Percentage of referrals that convert
    rewardsEarned: number; // Total rewards earned
    activeCampaigns: number; // Number of campaigns the referrer is active in
  }[];
  
  // Reward analytics
  rewardAnalytics: {
    totalRewardsIssued: number; // Total number of rewards issued
    totalRewardsRedeemed: number; // Total number of rewards redeemed
    redemptionRate: number; // Percentage of rewards that are redeemed
    averageTimeToRedemption: number; // Average time between issuance and redemption
    mostPopularRewardType: string; // Most popular type of reward
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Schema
const AnalyticsSchema = new Schema<IAnalytics>(
  {
    businessId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    companyName: { type: String, required: true },
    period: { 
      type: String, 
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: true
    },
    date: { type: Date, required: true },
    
    // Overall metrics
    metrics: {
      totalReferrals: { type: Number, default: 0 },
      successfulReferrals: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      totalRewards: { type: Number, default: 0 },
      totalReferrerRewards: { type: Number, default: 0 },
      averageRewardPerReferral: { type: Number, default: 0 },
      
      // Top performers
      topReferrers: [{
        referrerId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        referralCount: { type: Number, default: 0 },
        conversionCount: { type: Number, default: 0 },
        rewardsEarned: { type: Number, default: 0 }
      }],
      
      topCampaigns: [{
        campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
        name: { type: String },
        referralCount: { type: Number, default: 0 },
        conversionCount: { type: Number, default: 0 },
        conversionRate: { type: Number, default: 0 }
      }],
      
      // Financial metrics
      customerAcquisitionCost: { type: Number, default: 0 },
      revenueGenerated: { type: Number, default: 0 },
      roi: { type: Number, default: 0 }
    },
    
    // Campaign-specific performance
    campaignPerformance: [{
      campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
      name: { type: String },
      impressions: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      referrals: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      rewardsIssued: { type: Number, default: 0 },
      referrerRewardsIssued: { type: Number, default: 0 },
      roi: { type: Number, default: 0 }
    }],
    
    // Referrer-specific performance
    referrerPerformance: [{
      referrerId: { type: Schema.Types.ObjectId, ref: 'User' },
      name: { type: String },
      referralsGenerated: { type: Number, default: 0 },
      conversionsGenerated: { type: Number, default: 0 },
      conversionRate: { type: Number, default: 0 },
      rewardsEarned: { type: Number, default: 0 },
      activeCampaigns: { type: Number, default: 0 }
    }],
    
    // Reward analytics
    rewardAnalytics: {
      totalRewardsIssued: { type: Number, default: 0 },
      totalRewardsRedeemed: { type: Number, default: 0 },
      redemptionRate: { type: Number, default: 0 },
      averageTimeToRedemption: { type: Number, default: 0 },
      mostPopularRewardType: { type: String }
    }
  },
  { timestamps: true }
);

// Indexes for faster queries
AnalyticsSchema.index({ businessId: 1, period: 1, date: 1 }, { unique: true });
AnalyticsSchema.index({ companyName: 1 });
AnalyticsSchema.index({ date: 1 });

// Create and export the Analytics model
export const Analytics = models.Analytics || model<IAnalytics>('Analytics', AnalyticsSchema);

export default Analytics; 