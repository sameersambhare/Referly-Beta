import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  businessId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  status: 'active' | 'inactive' | 'lead';
  lastContactedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    businessId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    notes: { type: String },
    tags: [{ type: String }],
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'lead'], 
      default: 'lead' 
    },
    lastContactedAt: { type: Date },
  },
  { timestamps: true }
);

// Create a compound index for business and email to ensure uniqueness
CustomerSchema.index({ businessId: 1, email: 1 }, { unique: true });

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema); 