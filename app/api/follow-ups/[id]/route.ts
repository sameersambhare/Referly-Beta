import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { FollowUp, Customer } from '@/models';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

// Define validation schema for updating a follow-up
const updateFollowUpSchema = z.object({
  type: z.enum(['email', 'sms', 'call', 'meeting']).optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  scheduledDate: z.string().transform(str => new Date(str)).optional(),
  completedDate: z.string().transform(str => new Date(str)).optional(),
  notes: z.string().optional(),
  message: z.string().optional(),
  isAutomated: z.boolean().optional(),
});

// GET - Retrieve a specific follow-up
export async function GET(
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
    
    // Find follow-up
    const followUp = await FollowUp.findOne({
      _id: id,
      businessId: session.user.id
    })
      .populate('referralId')
      .populate('customerId');
    
    if (!followUp) {
      return NextResponse.json(
        { error: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(followUp);
  } catch (error: any) {
    console.error('Get follow-up error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update a specific follow-up
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
    const validationResult = updateFollowUpSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Find and update follow-up
    const updatedFollowUp = await FollowUp.findOneAndUpdate(
      {
        _id: id,
        businessId: session.user.id
      },
      validationResult.data,
      { new: true }
    );
    
    if (!updatedFollowUp) {
      return NextResponse.json(
        { error: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    // If status is changed to completed, update lastContactedAt for the customer
    if (validationResult.data.status === 'completed' && updatedFollowUp.customerId) {
      await Customer.findByIdAndUpdate(
        updatedFollowUp.customerId,
        { lastContactedAt: new Date() }
      );
    }
    
    return NextResponse.json(updatedFollowUp);
  } catch (error: any) {
    console.error('Update follow-up error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific follow-up
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
    
    // Find and delete follow-up
    const deletedFollowUp = await FollowUp.findOneAndDelete({
      _id: id,
      businessId: session.user.id
    });
    
    if (!deletedFollowUp) {
      return NextResponse.json(
        { error: 'Follow-up not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete follow-up error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 