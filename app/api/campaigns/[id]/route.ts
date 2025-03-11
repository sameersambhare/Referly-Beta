import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { Campaign } from '@/models';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

// Define validation schema for updating a campaign
const updateCampaignSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  description: z.string().optional(),
  startDate: z.string().transform(str => new Date(str)).optional(),
  endDate: z.string().optional().transform(str => str ? new Date(str) : undefined),
  isActive: z.boolean().optional(),
  rewardType: z.enum(['cash', 'discount', 'gift', 'points']).optional(),
  rewardAmount: z.number().min(0, 'Reward amount must be positive').optional(),
  rewardDescription: z.string().optional(),
  targetAudience: z.string().optional(),
  conversionCriteria: z.string().optional(),
  landingPageUrl: z.string().url().optional(),
  customMessage: z.string().optional(),
});

// GET - Retrieve a specific campaign
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    return NextResponse.json({
      message: "Campaign endpoint",
      id: params.id,
      status: "ok"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

// PATCH - Update a specific campaign
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
    const validationResult = updateCampaignSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find and update campaign
    const updatedCampaign = await Campaign.findOneAndUpdate(
      {
        _id: id,
        businessId: session.user.id
      },
      validationResult.data,
      { new: true }
    );
    
    if (!updatedCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedCampaign);
  } catch (error: any) {
    console.error('Update campaign error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific campaign
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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
    
    // Find and delete campaign
    const deletedCampaign = await Campaign.findOneAndDelete({
      _id: id,
      businessId: session.user.id
    });
    
    if (!deletedCampaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete campaign error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 