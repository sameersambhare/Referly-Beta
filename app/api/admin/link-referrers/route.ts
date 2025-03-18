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
    console.log('Connecting to database to link referrers to businesses...');
    const db = await connectToDatabase();
    console.log('Connected to database');
    
    // Get all business users
    const businessesCollection = db.collection('users');
    const businesses = await businessesCollection.find({
      role: 'business'
    }).toArray();
    
    console.log(`Found ${businesses.length} business users`);
    
    // Create a map of company names to business IDs
    const companyMap = new Map();
    businesses.forEach(business => {
      const companyName = business.company || business.businessName || business.name;
      if (companyName) {
        companyMap.set(companyName.toLowerCase(), business._id.toString());
      }
    });
    
    // Get all referrer users
    const referrersCollection = db.collection('users');
    const referrers = await referrersCollection.find({
      role: 'referrer'
    }).toArray();
    
    console.log(`Found ${referrers.length} referrer users`);
    
    // Link each referrer to a business based on company name
    const updates = [];
    for (const referrer of referrers) {
      if (referrer.company && !referrer.businessId) {
        const companyName = referrer.company.toLowerCase();
        const businessId = companyMap.get(companyName);
        
        if (businessId) {
          console.log(`Linking referrer ${referrer._id} to business ${businessId} based on company name: ${referrer.company}`);
          
          const result = await referrersCollection.updateOne(
            { _id: referrer._id },
            { $set: { businessId: businessId } }
          );
          
          updates.push({
            referrerId: referrer._id.toString(),
            businessId: businessId,
            companyName: referrer.company,
            updated: result.modifiedCount > 0
          });
        } else {
          console.log(`No matching business found for referrer ${referrer._id} with company: ${referrer.company}`);
        }
      }
    }
    
    return NextResponse.json({
      message: `Linked ${updates.length} referrers to businesses based on company name`,
      updates
    });
  } catch (error) {
    console.error('Error linking referrers to businesses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 