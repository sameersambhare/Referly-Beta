import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  businessId: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId;
  referredPersonName: string;
  referredPersonEmail: string;
  referredPersonPhone?: string;
  status: 'pending' | 'contacted' | 'converted' | 'declined';
  campaignId?: mongoose.Types.ObjectId;
  rewardStatus: 'pending' | 'approved' | 'paid' | 'declined';
  rewardAmount?: number;
  rewardType?: 'cash' | 'discount' | 'gift' | 'points';
  notes?: string;
  clickCount: number;
  conversionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
  {
    businessId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    referrerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    referredPersonName: { type: String, required: true },
    referredPersonEmail: { type: String, required: true },
    referredPersonPhone: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'contacted', 'converted', 'declined'], 
      default: 'pending' 
    },
    campaignId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Campaign' 
    },
    rewardStatus: { 
      type: String, 
      enum: ['pending', 'approved', 'paid', 'declined'], 
      default: 'pending' 
    },
    rewardAmount: { type: Number },
    rewardType: { 
      type: String, 
      enum: ['cash', 'discount', 'gift', 'points'] 
    },
    notes: { type: String },
    clickCount: { type: Number, default: 0 },
    conversionDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Referral || mongoose.model<IReferral>('Referral', ReferralSchema); 