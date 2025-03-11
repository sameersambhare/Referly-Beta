import { Schema, model, models, Document, Types } from 'mongoose';

export interface IReward extends Document {
  businessId: Types.ObjectId; // The business that created this reward
  companyName: string; // Name of the company (for easier querying)
  campaignId?: Types.ObjectId; // The campaign this reward is associated with (optional)
  referralId?: Types.ObjectId; // The referral this reward is associated with (optional)
  
  // Recipient information
  recipientType: 'referrer' | 'customer'; // Whether this reward is for a referrer or customer
  recipientId: Types.ObjectId; // The user receiving this reward
  recipientEmail: string; // Email of the recipient
  recipientName: string; // Name of the recipient
  
  // Reward details
  type: 'cash' | 'discount' | 'gift' | 'points'; // Type of reward
  amount: number; // Amount of the reward
  description: string; // Description of the reward
  code: string; // Unique code for redeeming the reward
  
  // Reward status
  status: 'pending' | 'issued' | 'redeemed' | 'expired' | 'cancelled'; // Current status of the reward
  createdAt: Date; // When the reward was created
  issuedAt?: Date; // When the reward was issued
  expiresAt?: Date; // When the reward expires
  redeemedAt?: Date; // When the reward was redeemed
  
  // Redemption details
  redemptionLocation?: 'online' | 'in-store'; // Where the reward was redeemed
  redemptionTransactionId?: string; // ID of the transaction where the reward was redeemed
  redemptionAmount?: number; // Amount that was actually redeemed (may be less than the reward amount)
  
  // Additional information
  notes?: string; // Any notes about this reward
  metadata?: Record<string, any>; // Additional metadata about this reward
}

// Reward Schema
const RewardSchema = new Schema<IReward>(
  {
    businessId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    companyName: { type: String, required: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign' },
    referralId: { type: Schema.Types.ObjectId, ref: 'Referral' },
    
    // Recipient information
    recipientType: { 
      type: String, 
      enum: ['referrer', 'customer'],
      required: true 
    },
    recipientId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    recipientEmail: { type: String, required: true },
    recipientName: { type: String, required: true },
    
    // Reward details
    type: { 
      type: String, 
      enum: ['cash', 'discount', 'gift', 'points'],
      required: true 
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    code: { 
      type: String, 
      required: true, 
      unique: true,
      default: () => Math.random().toString(36).substring(2, 10).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()
    },
    
    // Reward status
    status: { 
      type: String, 
      enum: ['pending', 'issued', 'redeemed', 'expired', 'cancelled'],
      default: 'pending'
    },
    issuedAt: { type: Date },
    expiresAt: { type: Date },
    redeemedAt: { type: Date },
    
    // Redemption details
    redemptionLocation: { 
      type: String, 
      enum: ['online', 'in-store']
    },
    redemptionTransactionId: { type: String },
    redemptionAmount: { type: Number },
    
    // Additional information
    notes: { type: String },
    metadata: { type: Map, of: Schema.Types.Mixed }
  },
  { timestamps: true }
);

// Indexes for faster queries
RewardSchema.index({ businessId: 1, status: 1 });
RewardSchema.index({ recipientId: 1, status: 1 });
RewardSchema.index({ code: 1 }, { unique: true });
RewardSchema.index({ companyName: 1 });
RewardSchema.index({ campaignId: 1 });
RewardSchema.index({ referralId: 1 });
RewardSchema.index({ expiresAt: 1 });

// Create and export the Reward model
export const Reward = models.Reward || model<IReward>('Reward', RewardSchema);

export default Reward; 