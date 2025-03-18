import { NextRequest, NextResponse } from 'next/server';
import { User, Referral, Campaign, Analytics } from '@/models';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

// Define validation schema
const submitReferralSchema = z.object({
  businessCode: z.string().min(5, 'Invalid business code'),
  referrerCode: z.string().min(5, 'Invalid referrer code'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  notes: z.string().optional(),
  campaignId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validationResult = submitReferralSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const { 
      businessCode, 
      referrerCode, 
      name, 
      email, 
      phone, 
      notes,
      campaignId
    } = validationResult.data;
    
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
    
    // Find the referrer
    const referrer = await User.findOne({ referralCode: referrerCode });
    
    if (!referrer) {
      return NextResponse.json(
        { error: 'Invalid referrer code' },
        { status: 404 }
      );
    }
    
    // Check if this referral already exists
    const existingReferral = await Referral.findOne({
      businessId: business._id,
      referrerId: referrer._id,
      referredPersonEmail: email
    });
    
    if (existingReferral) {
      return NextResponse.json(
        { error: 'This person has already been referred' },
        { status: 409 }
      );
    }
    
    // Find campaign if provided
    let campaign = null;
    if (campaignId) {
      campaign = await Campaign.findOne({
        _id: campaignId,
        businessId: business._id,
        isActive: true
      });
      
      if (!campaign) {
        return NextResponse.json(
          { error: 'Invalid or inactive campaign' },
          { status: 404 }
        );
      }
      
      // Increment campaign referral count
      await Campaign.findByIdAndUpdate(
        campaign._id,
        { $inc: { referralCount: 1 } }
      );
    }
    
    // Create new referral
    const newReferral = new Referral({
      businessId: business._id,
      referrerId: referrer._id,
      referredPersonName: name,
      referredPersonEmail: email,
      referredPersonPhone: phone,
      notes,
      campaignId: campaign ? campaign._id : undefined,
      clickCount: 1, // Initial click that led to this submission
    });
    
    await newReferral.save();
    
    // Update analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const analyticsUpdate = await Analytics.findOneAndUpdate(
      { 
        businessId: business._id,
        date: today,
        campaignId: campaign ? campaign._id : { $exists: false }
      },
      { 
        $inc: { referralCount: 1 },
        $setOnInsert: {
          businessId: business._id,
          date: today,
          clickCount: 0,
          conversionCount: 0,
          conversionRate: 0,
          rewardsPaid: 0,
          campaignId: campaign ? campaign._id : undefined
        }
      },
      { 
        upsert: true,
        new: true
      }
    );
    
    // Calculate conversion rate
    if (analyticsUpdate.clickCount > 0) {
      analyticsUpdate.conversionRate = (analyticsUpdate.referralCount / analyticsUpdate.clickCount) * 100;
      await analyticsUpdate.save();
    }
    
    return NextResponse.json({ 
      success: true,
      referralId: newReferral._id,
      message: 'Referral submitted successfully'
    });
  } catch (error: any) {
    console.error('Submit referral error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 