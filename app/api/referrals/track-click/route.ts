import { NextRequest, NextResponse } from 'next/server';
import { User, Referral, Analytics } from '@/models';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

// Define validation schema
const trackClickSchema = z.object({
  businessCode: z.string().min(5, 'Invalid business code'),
  referrerCode: z.string().min(5, 'Invalid referrer code').optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validationResult = trackClickSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { businessCode, referrerCode } = validationResult.data;
    
    // Connect to database
    await connectToDatabase();
    
    // Find the business
    const business = await User.findOne({ 
      referralCode: businessCode,
      role: 'business'
    });
    
    if (!business) {
      return NextResponse.json(
        { error: 'Invalid business code' },
        { status: 404 }
      );
    }
    
    // If referrer code is provided, find the referrer
    let referrer = null;
    if (referrerCode) {
      referrer = await User.findOne({ referralCode: referrerCode });
      
      if (!referrer) {
        return NextResponse.json(
          { error: 'Invalid referrer code' },
          { status: 404 }
        );
      }
      
      // Update click count for existing referrals from this referrer
      await Referral.updateMany(
        { 
          businessId: business._id,
          referrerId: referrer._id
        },
        { $inc: { clickCount: 1 } }
      );
    }
    
    // Update analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const analyticsUpdate = await Analytics.findOneAndUpdate(
      { 
        businessId: business._id,
        date: today
      },
      { 
        $inc: { clickCount: 1 },
        $setOnInsert: {
          businessId: business._id,
          date: today,
          referralCount: 0,
          conversionCount: 0,
          conversionRate: 0,
          rewardsPaid: 0
        }
      },
      { 
        upsert: true,
        new: true
      }
    );
    
    return NextResponse.json({ 
      success: true,
      businessName: business.businessName || business.name
    });
  } catch (error: any) {
    console.error('Track click error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 