import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import connectToDatabase from '@/lib/mongodb';
import Campaign from '@/models/Campaign';
import { z } from 'zod';

// Define validation schema for creating a campaign
const createCampaignSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  rewardType: z.enum(['cash', 'discount', 'gift', 'points']),
  rewardAmount: z.number().min(0, 'Reward amount must be positive'),
  rewardDescription: z.string().optional(),
  targetAudience: z.string().optional(),
  conversionCriteria: z.string().optional(),
  landingPageUrl: z.string().url().optional(),
  customMessage: z.string().optional(),
});

// GET - Retrieve all campaigns for the authenticated business
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'business') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('isActive');
    
    // Build query
    const query: any = { businessId: session.user.id };
    
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }
    
    // Fetch campaigns
    const campaigns = await Campaign.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(campaigns);
  } catch (error: any) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new campaign
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'business') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Validate request body
    const validationResult = createCampaignSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Create new campaign
    const newCampaign = new Campaign({
      ...validationResult.data,
      businessId: session.user.id,
      isActive: true,
    });
    
    await newCampaign.save();
    
    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error: any) {
    console.error('Create campaign error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 