import { Schema, Types } from 'mongoose';
import User, { IUser } from './User';

// Regular Customer User (Person who has been referred)
export interface ICustomer extends IUser {
  role: 'customer';
  referredBy: Types.ObjectId; // The referrer who referred this customer
  referralCode?: string; // Their own referral code if they become a referrer
  businessId: Types.ObjectId; // The business they were referred to
  conversionStatus: 'pending' | 'converted' | 'lost'; // Whether they've completed the desired action
  conversionDate?: Date; // When they completed the conversion
  purchases: Types.ObjectId[]; // Their purchases from the business
  availableRewards: Types.ObjectId[]; // Rewards earned from being referred
  redeemedRewards: Types.ObjectId[]; // Rewards that have been redeemed
  loyaltyPoints?: number; // Any loyalty points they've earned
  referralId: Types.ObjectId; // The referral record that brought them in
  preferences?: {
    categories?: string[];
    communicationPreferences?: {
      email: boolean;
      sms: boolean;
    };
  };
  customerValue?: number; // Lifetime value of this customer
  notes?: string; // Any notes about this customer
}

// Customer Schema
const CustomerSchema = new Schema<ICustomer>({
  referredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  referralCode: { type: String },
  businessId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  conversionStatus: { 
    type: String, 
    enum: ['pending', 'converted', 'lost'],
    default: 'pending'
  },
  conversionDate: { type: Date },
  purchases: [{ type: Schema.Types.ObjectId, ref: 'Purchase' }],
  availableRewards: [{ type: Schema.Types.ObjectId, ref: 'Reward' }],
  redeemedRewards: [{ type: Schema.Types.ObjectId, ref: 'Reward' }],
  loyaltyPoints: { type: Number, default: 0 },
  referralId: { type: Schema.Types.ObjectId, ref: 'Referral', required: true },
  preferences: {
    categories: [{ type: String }],
    communicationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  customerValue: { type: Number, default: 0 },
  notes: { type: String }
});

// Create the Customer model as a discriminator of User
export const Customer = User.discriminators?.Customer || 
  User.discriminator<ICustomer>('Customer', CustomerSchema);

export default Customer; 