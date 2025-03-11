import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { connectToDatabase } from '@/lib/mongodb';
import { FollowUp } from '@/models';
import { z } from 'zod';

// Define validation schema for creating a follow-up
const createFollowUpSchema = z.object({
  referralId: z.string().optional(),
  customerId: z.string().optional(),
  type: z.enum(['email', 'sms', 'call', 'meeting']),
  scheduledDate: z.string().transform(str => new Date(str)),
  notes: z.string().optional(),
  message: z.string().optional(),
  isAutomated: z.boolean().default(false),
});

// GET - Retrieve all follow-ups for the authenticated business
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
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const referralId = searchParams.get('referralId');
    const customerId = searchParams.get('customerId');
    const isAutomated = searchParams.get('isAutomated');
    
    // Build query
    const query: any = { businessId: session.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (referralId) {
      query.referralId = referralId;
    }
    
    if (customerId) {
      query.customerId = customerId;
    }
    
    if (isAutomated !== null) {
      query.isAutomated = isAutomated === 'true';
    }
    
    // Fetch follow-ups
    const followUps = await FollowUp.find(query)
      .sort({ scheduledDate: 1 })
      .populate('referralId')
      .populate('customerId');
    
    return NextResponse.json(followUps);
  } catch (error: any) {
    console.error('Get follow-ups error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new follow-up
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
    const validationResult = createFollowUpSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Ensure either referralId or customerId is provided
    if (!validationResult.data.referralId && !validationResult.data.customerId) {
      return NextResponse.json(
        { error: 'Either referralId or customerId must be provided' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Create new follow-up
    const newFollowUp = new FollowUp({
      ...validationResult.data,
      businessId: session.user.id,
      status: 'scheduled',
    });
    
    await newFollowUp.save();
    
    return NextResponse.json(newFollowUp, { status: 201 });
  } catch (error: any) {
    console.error('Create follow-up error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 