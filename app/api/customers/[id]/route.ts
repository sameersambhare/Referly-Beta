import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { Customer } from '@/models';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';

// Define validation schema for updating a customer
const updateCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'lead']).optional(),
  lastContactedAt: z.string().transform(str => new Date(str)).optional(),
});

// GET - Retrieve a specific customer
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    return NextResponse.json({
      message: "Customer endpoint",
      id: params.id,
      status: "ok"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

// PATCH - Update a specific customer
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
    const validationResult = updateCustomerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // If email is being updated, check for duplicates
    if (validationResult.data.email) {
      const existingCustomer = await Customer.findOne({
        businessId: session.user.id,
        email: validationResult.data.email,
        _id: { $ne: id }
      });
      
      if (existingCustomer) {
        return NextResponse.json(
          { error: 'Another customer with this email already exists' },
          { status: 409 }
        );
      }
    }
    
    // Find and update customer
    const updatedCustomer = await Customer.findOneAndUpdate(
      {
        _id: id,
        businessId: session.user.id
      },
      validationResult.data,
      { new: true }
    );
    
    if (!updatedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedCustomer);
  } catch (error: any) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific customer
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
    
    // Find and delete customer
    const deletedCustomer = await Customer.findOneAndDelete({
      _id: id,
      businessId: session.user.id
    });
    
    if (!deletedCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 