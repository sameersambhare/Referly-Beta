import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { User } from '@/models';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

// Define validation schema for non-authenticated users
const referralLinkSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  businessReferralCode: z.string().min(5, 'Invalid referral code'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Connect to database
    await connectToDatabase();
    
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (session) {
      // For authenticated users (businesses)
      const userId = session.user.id;
      const user = await User.findById(userId);
      
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      
      // Return the business's referral code
      const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/refer/${user.referralCode}`;
      
      return NextResponse.json({ referralLink, referralCode: user.referralCode });
    } else {
      // For non-authenticated users (referrers)
      const validationResult = referralLinkSchema.safeParse(body);
      
      if (!validationResult.success) {
        return NextResponse.json(
          { error: validationResult.error.errors },
          { status: 400 }
        );
      }
      
      const { name, email, phone, businessReferralCode } = validationResult.data;
      
      // Find the business by referral code
      const business = await User.findOne({ 
        referralCode: businessReferralCode,
        role: 'business'
      });
      
      if (!business) {
        return NextResponse.json(
          { error: 'Invalid business referral code' },
          { status: 404 }
        );
      }
      
      // Create or find referrer
      let referrer;
      
      if (email) {
        referrer = await User.findOne({ email });
      }
      
      if (!referrer) {
        // Generate a unique referral code for this referrer
        const referralCode = generateReferralCode(name);
        
        referrer = new User({
          name,
          email,
          phone,
          role: 'referrer',
          password: Math.random().toString(36).slice(-10), // Random password
          referralCode,
          referredBy: business._id,
        });
        
        await referrer.save();
      }
      
      // Generate personalized referral link
      const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/refer/${business.referralCode}/${referrer.referralCode}`;
      
      return NextResponse.json({ 
        referralLink, 
        referralCode: referrer.referralCode,
        businessCode: business.referralCode
      });
    }
  } catch (error: any) {
    console.error('Generate referral link error:', error);
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