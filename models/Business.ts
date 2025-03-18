import { Schema, Types } from 'mongoose';
import User, { IUser } from './User';

// Business User
export interface IBusiness extends IUser {
  role: 'business';
  businessName: string;
  industry?: string;
  website?: string;
  address?: string;
  phone?: string;
  subscription?: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
  };
  campaigns: Types.ObjectId[];
  rewards: Types.ObjectId[]; // References to rewards created by this business
  referrers: Types.ObjectId[]; // References to referrers associated with this business
  customers: Types.ObjectId[]; // References to customers acquired through referrals
  settings?: {
    notificationPreferences: {
      email: boolean;
      dashboard: boolean;
    };
    branding?: {
      logo?: string;
      colors?: {
        primary?: string;
        secondary?: string;
      };
    };
    rewardSettings?: {
      defaultReferrerReward: {
        type: 'cash' | 'discount' | 'gift' | 'points';
        amount: number;
      };
      defaultCustomerReward: {
        type: 'cash' | 'discount' | 'gift' | 'points';
        amount: number;
      };
      autoApproveRewards: boolean;
    };
  };
  redeemPageUrl?: string; // URL for the business's reward redemption page
}

// Business Schema
const BusinessSchema = new Schema<IBusiness>({
  businessName: { type: String, required: true },
  industry: { type: String },
  website: { type: String },
  address: { type: String },
  phone: { type: String },
  subscription: {
    plan: { 
      type: String, 
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true }
  },
  campaigns: [{ type: Schema.Types.ObjectId, ref: 'Campaign' }],
  rewards: [{ type: Schema.Types.ObjectId, ref: 'Reward' }],
  referrers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  customers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  settings: {
    notificationPreferences: {
      email: { type: Boolean, default: true },
      dashboard: { type: Boolean, default: true }
    },
    branding: {
      logo: { type: String },
      colors: {
        primary: { type: String },
        secondary: { type: String }
      }
    },
    rewardSettings: {
      defaultReferrerReward: {
        type: { type: String, enum: ['cash', 'discount', 'gift', 'points'], default: 'discount' },
        amount: { type: Number, default: 10 }
      },
      defaultCustomerReward: {
        type: { type: String, enum: ['cash', 'discount', 'gift', 'points'], default: 'discount' },
        amount: { type: Number, default: 10 }
      },
      autoApproveRewards: { type: Boolean, default: false }
    }
  },
  redeemPageUrl: { type: String }
});

// Create the Business model as a discriminator of User
export const Business = User.discriminators?.Business || 
  User.discriminator<IBusiness>('Business', BusinessSchema);

export default Business; 