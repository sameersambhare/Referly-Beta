import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { z } from 'zod';

// Define validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['business', 'admin', 'referrer']).default('business'),
  businessName: z.string().optional(),
  industry: z.string().optional(),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { name, email, password, role, businessName, industry, phone, referralCode } = validationResult.data;
    
    // Connect to database
    await connectToDatabase();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create referral code for business users if not provided
    let userReferralCode = referralCode;
    if (role === 'business' && !userReferralCode) {
      userReferralCode = generateReferralCode(name);
    }
    
    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role,
      businessName: role === 'business' ? businessName : undefined,
      industry: role === 'business' ? industry : undefined,
      phone,
      referralCode: userReferralCode,
    });
    
    // If referral code is provided, find the referring user
    if (referralCode && role === 'business') {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        newUser.referredBy = referrer._id;
      }
    }
    
    await newUser.save();
    
    // Return success response without password
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      businessName: newUser.businessName,
      referralCode: newUser.referralCode,
    };
    
    return NextResponse.json(userResponse, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate a referral code
function generateReferralCode(name: string): string {
  const namePrefix = name.substring(0, 3).toUpperCase();
  const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${namePrefix}-${randomString}`;
} 