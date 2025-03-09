import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';
import { z } from 'zod';

// Define validation schema for creating a customer
const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'inactive', 'lead']).default('lead'),
});

// Define validation schema for bulk import
const bulkImportSchema = z.array(
  z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['active', 'inactive', 'lead']).default('lead'),
  })
);

// GET - Retrieve all customers for the authenticated business
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
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    
    // Build query
    const query: any = { businessId: session.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    
    // Fetch customers
    const customers = await Customer.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(customers);
  } catch (error: any) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new customer or bulk import customers
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
    
    // Connect to database
    await connectToDatabase();
    
    // Check if this is a bulk import
    const isBulkImport = Array.isArray(body);
    
    if (isBulkImport) {
      // Validate bulk import data
      const validationResult = bulkImportSchema.safeParse(body);
      
      if (!validationResult.success) {
        return NextResponse.json(
          { error: validationResult.error.errors },
          { status: 400 }
        );
      }
      
      const customersData = validationResult.data.map(customer => ({
        ...customer,
        businessId: session.user.id,
      }));
      
      // Use bulkWrite to handle duplicates
      const operations = customersData.map(customer => ({
        updateOne: {
          filter: { 
            businessId: session.user.id,
            email: customer.email
          },
          update: { $set: customer },
          upsert: true
        }
      }));
      
      const result = await Customer.bulkWrite(operations);
      
      return NextResponse.json({
        success: true,
        inserted: result.upsertedCount,
        modified: result.modifiedCount,
        total: customersData.length
      });
    } else {
      // Single customer creation
      const validationResult = createCustomerSchema.safeParse(body);
      
      if (!validationResult.success) {
        return NextResponse.json(
          { error: validationResult.error.errors },
          { status: 400 }
        );
      }
      
      // Check if customer already exists
      const existingCustomer = await Customer.findOne({
        businessId: session.user.id,
        email: validationResult.data.email
      });
      
      if (existingCustomer) {
        return NextResponse.json(
          { error: 'Customer with this email already exists' },
          { status: 409 }
        );
      }
      
      // Create new customer
      const newCustomer = new Customer({
        ...validationResult.data,
        businessId: session.user.id,
      });
      
      await newCustomer.save();
      
      return NextResponse.json(newCustomer, { status: 201 });
    }
  } catch (error: any) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 