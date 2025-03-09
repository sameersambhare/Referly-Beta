import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUp extends Document {
  businessId: mongoose.Types.ObjectId;
  referralId?: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  type: 'email' | 'sms' | 'call' | 'meeting';
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledDate: Date;
  completedDate?: Date;
  notes?: string;
  message?: string;
  isAutomated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    businessId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    referralId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Referral' 
    },
    customerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Customer' 
    },
    type: { 
      type: String, 
      enum: ['email', 'sms', 'call', 'meeting'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['scheduled', 'completed', 'cancelled'], 
      default: 'scheduled' 
    },
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    notes: { type: String },
    message: { type: String },
    isAutomated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure either referralId or customerId is provided
FollowUpSchema.pre('validate', function(next) {
  if (!this.referralId && !this.customerId) {
    next(new Error('Either referralId or customerId must be provided'));
  } else {
    next();
  }
});

export default mongoose.models.FollowUp || mongoose.model<IFollowUp>('FollowUp', FollowUpSchema); 