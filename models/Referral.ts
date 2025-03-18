import { Schema, model, models, Document, Types } from 'mongoose';

export interface IReferral extends Document {
  campaignId: Types.ObjectId; // The campaign this referral is part of
  businessId: Types.ObjectId; // The business this referral is for
  companyName: string; // Name of the company (for easier querying)
  referrerId: Types.ObjectId; // The referrer who made this referral
  refereeEmail: string; // Email of the person being referred
  refereeName?: string; // Name of the person being referred
  status: 'pending' | 'clicked' | 'converted' | 'expired' | 'rejected'; // Current status of the referral
  referralCode: string; // Unique code for this specific referral
  referralLink: string; // Full link sent to the referee
  createdAt: Date; // When the referral was created
  updatedAt: Date; // When the referral was last updated
  clickedAt?: Date; // When the referee clicked the link
  convertedAt?: Date; // When the referee completed the desired action
  expiresAt?: Date; // When the referral expires
  customerId?: Types.ObjectId; // Reference to the customer record if converted
  
  // Reward tracking
  referrerReward?: {
    rewardId?: Types.ObjectId; // Reference to the reward
    type: 'cash' | 'discount' | 'gift' | 'points'; // Type of reward
    amount: number; // Amount of the reward
    status: 'pending' | 'approved' | 'paid' | 'rejected'; // Status of the reward
    approvedAt?: Date; // When the reward was approved
    paidAt?: Date; // When the reward was paid
  };
  
  customerReward?: {
    rewardId?: Types.ObjectId; // Reference to the reward
    type: 'cash' | 'discount' | 'gift' | 'points'; // Type of reward
    amount: number; // Amount of the reward
    status: 'pending' | 'approved' | 'paid' | 'rejected'; // Status of the reward
    approvedAt?: Date; // When the reward was approved
    paidAt?: Date; // When the reward was paid
  };
  
  // Conversion details
  conversionDetails?: {
    purchaseAmount?: number; // Amount of the purchase if applicable
    productsPurchased?: string[]; // Products purchased if applicable
    transactionId?: string; // ID of the transaction if applicable
  };
  
  // Additional tracking
  utmParameters?: Record<string, string>; // UTM parameters for tracking
  ipAddress?: string; // IP address of the referee when they clicked
  userAgent?: string; // User agent of the referee when they clicked
  notes?: string; // Any notes about this referral
}

// Referral Schema
const ReferralSchema = new Schema<IReferral>(
  {
    campaignId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Campaign', 
      required: true 
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    companyName: { type: String, required: true },
    referrerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    refereeEmail: { type: String, required: true },
    refereeName: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'clicked', 'converted', 'expired', 'rejected'],
      default: 'pending'
    },
    referralCode: { type: String, required: true },
    referralLink: { type: String, required: true },
    clickedAt: { type: Date },
    convertedAt: { type: Date },
    expiresAt: { type: Date },
    customerId: { type: Schema.Types.ObjectId, ref: 'User' },
    
    // Reward tracking
    referrerReward: {
      rewardId: { type: Schema.Types.ObjectId, ref: 'Reward' },
      type: { 
        type: String, 
        enum: ['cash', 'discount', 'gift', 'points'],
        required: true
      },
      amount: { type: Number, required: true },
      status: { 
        type: String, 
        enum: ['pending', 'approved', 'paid', 'rejected'],
        default: 'pending'
      },
      approvedAt: { type: Date },
      paidAt: { type: Date }
    },
    
    customerReward: {
      rewardId: { type: Schema.Types.ObjectId, ref: 'Reward' },
      type: { 
        type: String, 
        enum: ['cash', 'discount', 'gift', 'points'],
        required: true
      },
      amount: { type: Number, required: true },
      status: { 
        type: String, 
        enum: ['pending', 'approved', 'paid', 'rejected'],
        default: 'pending'
      },
      approvedAt: { type: Date },
      paidAt: { type: Date }
    },
    
    // Conversion details
    conversionDetails: {
      purchaseAmount: { type: Number },
      productsPurchased: [{ type: String }],
      transactionId: { type: String }
    },
    
    // Additional tracking
    utmParameters: { type: Map, of: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    notes: { type: String }
  },
  { timestamps: true }
);

// Indexes for faster queries
ReferralSchema.index({ referrerId: 1, status: 1 });
ReferralSchema.index({ campaignId: 1, status: 1 });
ReferralSchema.index({ businessId: 1, status: 1 });
ReferralSchema.index({ refereeEmail: 1 });
ReferralSchema.index({ referralCode: 1 }, { unique: true });
ReferralSchema.index({ companyName: 1 });
ReferralSchema.index({ 'referrerReward.status': 1 });
ReferralSchema.index({ 'customerReward.status': 1 });

// Create and export the Referral model
export const Referral = models.Referral || model<IReferral>('Referral', ReferralSchema);

export default Referral; 