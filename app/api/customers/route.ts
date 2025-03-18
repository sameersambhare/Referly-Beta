import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { Customer } from '@/models';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

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
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'business') {
      return NextResponse.json(
        { error: 'Unauthorized. Only business accounts can access customer data.' },
        { status: 401 }
      );
    }
    
    const businessId = session.user.id;
    
    // Connect to the database
    const db = await connectToDatabase();
    
    // Fetch customers associated with this business
    // This includes both regular customers and referrers
    const customers = await db.collection('users')
      .find({
        businessId: new ObjectId(businessId),
        role: { $in: ['customer', 'referrer'] }
      })
      .project({
        password: 0 // Exclude password field
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Fetch referrals data to enhance customer info
    const referralIds = customers
      .filter(c => c.role === 'referrer')
      .map(c => c._id);

    const referrals = await db.collection('referrals')
      .aggregate([
        {
          $match: {
            referrerId: { $in: referralIds }
          }
        },
        {
          $group: {
            _id: '$referrerId',
            totalReferrals: { $sum: 1 },
            successfulReferrals: {
              $sum: {
                $cond: [{ $eq: ['$status', 'converted'] }, 1, 0]
              }
            }
          }
        }
      ])
      .toArray();
    
    // Fetch rewards data to enhance customer info
    const rewards = await db.collection('rewards')
      .aggregate([
        {
          $match: {
            userId: { $in: customers.map(c => c._id) }
          }
        },
        {
          $group: {
            _id: '$userId',
            totalRewards: { $sum: 1 },
            totalValue: { $sum: '$amount' }
          }
        }
      ])
      .toArray();
    
    // Get the most recent contact date for each customer from referrals
    const contactDates = await db.collection('referrals')
      .aggregate([
        {
          $match: {
            businessId: new ObjectId(businessId),
            $or: [
              { referrerId: { $in: customers.map(c => c._id) } },
              { customerId: { $in: customers.map(c => c._id) } }
            ]
          }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $ne: ['$customerId', null] },
                '$customerId',
                '$referrerId'
              ]
            },
            lastContactedAt: { $max: '$updatedAt' }
          }
        }
      ])
      .toArray();
    
    // Prepare enhanced customer data
    const enhancedCustomers = customers.map(customer => {
      // Find referral stats if customer is a referrer
      const referralStats = referrals.find(r => 
        r._id.toString() === customer._id.toString()
      );
      
      // Find reward stats
      const rewardStats = rewards.find(r => 
        r._id.toString() === customer._id.toString()
      );
      
      // Find last contacted date
      const contactInfo = contactDates.find(c => 
        c._id.toString() === customer._id.toString()
      );
      
      // Set a default status based on various factors
      let status = 'inactive';
      
      if (customer.role === 'referrer') {
        if (referralStats && referralStats.totalReferrals > 0) {
          status = 'active';
        } else {
          status = 'lead';
        }
      } else if (customer.role === 'customer') {
        if (customer.conversionStatus === 'converted') {
          status = 'active';
        } else if (customer.conversionStatus === 'pending') {
          status = 'lead';
        }
      }
      
      // Prepare tags based on user attributes
      const tags = [];
      
      if (customer.role === 'referrer') {
        tags.push('Referrer');
      }
      
      if (customer.role === 'customer') {
        tags.push('Customer');
        
        if (customer.conversionStatus === 'converted') {
          tags.push('Converted');
        } else if (customer.conversionStatus === 'pending') {
          tags.push('Pending');
        }
      }
      
      if (referralStats && referralStats.successfulReferrals > 0) {
        tags.push('Successful Referrer');
      }
      
      if (rewardStats && rewardStats.totalRewards > 0) {
        tags.push('Rewarded');
      }
      
      return {
        _id: customer._id.toString(),
        name: customer.name,
        email: customer.email,
        phone: customer.phone || null,
        role: customer.role,
        status,
        tags,
        notes: customer.notes || null,
        lastContactedAt: contactInfo?.lastContactedAt || null,
        createdAt: customer.createdAt || null,
        updatedAt: customer.updatedAt || null,
        referralStats: customer.role === 'referrer' ? {
          totalReferrals: referralStats?.totalReferrals || 0,
          successfulReferrals: referralStats?.successfulReferrals || 0,
          conversionRate: referralStats && referralStats.totalReferrals > 0
            ? Math.round((referralStats.successfulReferrals / referralStats.totalReferrals) * 100)
            : 0
        } : null,
        rewardStats: {
          totalRewards: rewardStats?.totalRewards || 0,
          totalValue: rewardStats?.totalValue || 0
        }
      };
    });
    
    return NextResponse.json(enhancedCustomers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
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