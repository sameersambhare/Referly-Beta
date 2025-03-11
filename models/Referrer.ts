import { Schema, Types } from 'mongoose';
import User, { IUser } from './User';

// Referrer User (Company's customer who refers others)
export interface IReferrer extends IUser {
  role: 'referrer';
  company: string; // Name of the company they're associated with
  businessId: Types.ObjectId; // Reference to the business they're referring for
  referralCode: string; // Unique code used for tracking referrals
  referrals: Types.ObjectId[]; // References to referrals made by this referrer
  selectedCampaigns: Types.ObjectId[]; // Campaigns they've chosen to promote
  earnings: number; // Total earnings from successful referrals
  availableRewards: Types.ObjectId[]; // Rewards earned but not yet redeemed
  redeemedRewards: Types.ObjectId[]; // Rewards that have been redeemed
  paymentInfo?: {
    paypalEmail?: string;
    bankAccount?: {
      accountNumber: string;
      routingNumber: string;
      bankName: string;
    };
  };
  metrics?: {
    totalReferrals: number;
    successfulReferrals: number;
    conversionRate: number;
    totalEarnings: number;
  };
  // Additional customer information
  customerSince: Date; // When they became a customer of the business
  purchaseHistory?: Types.ObjectId[]; // Their purchases from the business
  loyaltyPoints?: number; // Any loyalty points they've earned
}

// Referrer Schema
const ReferrerSchema = new Schema<IReferrer>({
  company: { type: String, required: true },
  businessId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => Math.random().toString(36).substring(2, 8).toUpperCase()
  },
  referrals: [{ type: Schema.Types.ObjectId, ref: 'Referral' }],
  selectedCampaigns: [{ type: Schema.Types.ObjectId, ref: 'Campaign' }],
  earnings: { type: Number, default: 0 },
  availableRewards: [{ type: Schema.Types.ObjectId, ref: 'Reward' }],
  redeemedRewards: [{ type: Schema.Types.ObjectId, ref: 'Reward' }],
  paymentInfo: {
    paypalEmail: { type: String },
    bankAccount: {
      accountNumber: { type: String },
      routingNumber: { type: String },
      bankName: { type: String }
    }
  },
  metrics: {
    totalReferrals: { type: Number, default: 0 },
    successfulReferrals: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 }
  },
  customerSince: { type: Date, default: Date.now },
  purchaseHistory: [{ type: Schema.Types.ObjectId, ref: 'Purchase' }],
  loyaltyPoints: { type: Number, default: 0 }
});

// Create the Referrer model as a discriminator of User
export const Referrer = User.discriminators?.Referrer || 
  User.discriminator<IReferrer>('Referrer', ReferrerSchema);

export default Referrer; 