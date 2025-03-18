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
    console.log('Connecting to database to update referrers...');
    const db = await connectToDatabase();
    console.log('Connected to database');
    
    // Get all business users
    const businessesCollection = db.collection('users');
    const businesses = await businessesCollection.find({
      role: 'business'
    }).toArray();
    
    console.log(`Found ${businesses.length} business users`);
    
    // Get all referrer users
    const referrersCollection = db.collection('users');
    const referrers = await referrersCollection.find({
      role: 'referrer'
    }).toArray();
    
    console.log(`Found ${referrers.length} referrer users`);
    
    // Create a map of business IDs to business names
    const businessMap = new Map();
    businesses.forEach(business => {
      businessMap.set(
        business._id.toString(), 
        business.businessName || business.name || 'Unknown Business'
      );
    });
    
    // Update each referrer with their company name
    const updates = [];
    for (const referrer of referrers) {
      if (referrer.businessId) {
        const businessId = referrer.businessId.toString();
        const companyName = businessMap.get(businessId);
        
        if (companyName && (!referrer.company || referrer.company !== companyName)) {
          console.log(`Updating referrer ${referrer._id} with company name: ${companyName}`);
          
          const result = await referrersCollection.updateOne(
            { _id: referrer._id },
            { $set: { company: companyName } }
          );
          
          updates.push({
            referrerId: referrer._id.toString(),
            businessId: businessId,
            companyName: companyName,
            updated: result.modifiedCount > 0
          });
        }
      }
    }
    
    return NextResponse.json({
      message: `Updated ${updates.length} referrers with company information`,
      updates
    });
  } catch (error) {
    console.error('Error updating referrers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 