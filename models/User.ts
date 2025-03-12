import { Schema, model, models, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

// Base User interface with common fields
export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'business' | 'referrer' | 'customer' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  image?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Base User Schema
const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['business', 'referrer', 'customer', 'admin'], 
      required: true 
    },
    image: { type: String },
  },
  { 
    timestamps: true,
    discriminatorKey: 'role' 
  }
);

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    console.log(`Hashing password for user: ${this.email}`);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    console.error(`Error hashing password: ${error.message}`);
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    console.log(`Comparing password for user: ${this.email}`);
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log(`Password match result: ${isMatch}`);
    return isMatch;
  } catch (error: any) {
    console.error(`Error comparing password: ${error.message}`);
    return false;
  }
};

// Create and export the User model
export const User = models.User || model<IUser>('User', UserSchema);

export default User; 
 