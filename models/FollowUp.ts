import { Schema, model, models, Document, Types } from 'mongoose';

export interface IFollowUp extends Document {
  businessId: Types.ObjectId; // The business this follow-up is for
  customerId: Types.ObjectId; // The customer this follow-up is for
  referralId?: Types.ObjectId; // The referral this follow-up is related to (optional)
  
  // Follow-up details
  type: 'email' | 'call' | 'meeting' | 'other'; // Type of follow-up
  status: 'pending' | 'completed' | 'cancelled'; // Status of the follow-up
  priority: 'low' | 'medium' | 'high'; // Priority of the follow-up
  
  // Scheduling
  scheduledDate: Date; // When the follow-up is scheduled for
  completedDate?: Date; // When the follow-up was completed
  
  // Content
  subject: string; // Subject of the follow-up
  notes?: string; // Notes about the follow-up
  outcome?: string; // Outcome of the follow-up
  
  // Assignment
  assignedTo?: Types.ObjectId; // User assigned to this follow-up
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// FollowUp Schema
const FollowUpSchema = new Schema<IFollowUp>(
  {
    businessId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    customerId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    referralId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Referral' 
    },
    
    // Follow-up details
    type: { 
      type: String, 
      enum: ['email', 'call', 'meeting', 'other'],
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'cancelled'],
      default: 'pending'
    },
    priority: { 
      type: String, 
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    
    // Scheduling
    scheduledDate: { 
      type: Date, 
      required: true 
    },
    completedDate: { 
      type: Date 
    },
    
    // Content
    subject: { 
      type: String, 
      required: true 
    },
    notes: { 
      type: String 
    },
    outcome: { 
      type: String 
    },
    
    // Assignment
    assignedTo: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { timestamps: true }
);

// Indexes for faster queries
FollowUpSchema.index({ businessId: 1, status: 1 });
FollowUpSchema.index({ customerId: 1 });
FollowUpSchema.index({ scheduledDate: 1 });
FollowUpSchema.index({ assignedTo: 1 });

// Create and export the FollowUp model
export const FollowUp = models.FollowUp || model<IFollowUp>('FollowUp', FollowUpSchema);

export default FollowUp; 