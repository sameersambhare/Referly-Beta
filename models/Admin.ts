import { Schema } from 'mongoose';
import User, { IUser } from './User';

// Admin User
export interface IAdmin extends IUser {
  role: 'admin';
  permissions: string[];
  lastLogin?: Date;
  activityLog?: {
    action: string;
    timestamp: Date;
    details?: string;
  }[];
}

// Admin Schema
const AdminSchema = new Schema<IAdmin>({
  permissions: [{ type: String }],
  lastLogin: { type: Date },
  activityLog: [{
    action: { type: String },
    timestamp: { type: Date },
    details: { type: String }
  }]
});

// Create the Admin model as a discriminator of User
export const Admin = User.discriminators?.Admin || 
  User.discriminator<IAdmin>('Admin', AdminSchema);

export default Admin; 