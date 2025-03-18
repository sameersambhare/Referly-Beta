import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users to access this endpoint
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Connect to the database
    console.log('Connecting to database to update businesses...');
    const db = await connectToDatabase();
    console.log('Connected to database');
    
    // Get all business users
    const businessesCollection = db.collection('users');
    const businesses = await businessesCollection.find({
      role: 'business'
    }).toArray();
    
    console.log(`Found ${businesses.length} business users`);
    
    // Update each business with their company name
    const updates = [];
    for (const business of businesses) {
      const businessName = business.businessName || business.name || 'Unknown Business';
      
      // Only update if the company field is missing or different
      if (!business.company || business.company !== businessName) {
        console.log(`Updating business ${business._id} with company name: ${businessName}`);
        
        const result = await businessesCollection.updateOne(
          { _id: business._id },
          { $set: { company: businessName } }
        );
        
        updates.push({
          businessId: business._id.toString(),
          businessName: businessName,
          updated: result.modifiedCount > 0
        });
      }
    }
    
    return NextResponse.json({
      message: `Updated ${updates.length} businesses with company information`,
      updates
    });
  } catch (error) {
    console.error('Error updating businesses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 