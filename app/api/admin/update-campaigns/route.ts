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
    console.log('Connecting to database to update campaigns...');
    const db = await connectToDatabase();
    console.log('Connected to database');
    
    // Get all business users
    const businessesCollection = db.collection('users');
    const businesses = await businessesCollection.find({
      role: 'business'
    }).toArray();
    
    console.log(`Found ${businesses.length} business users`);
    
    // Create a map of business IDs to business names
    const businessMap = new Map();
    businesses.forEach(business => {
      businessMap.set(
        business._id.toString(), 
        business.businessName || business.name || 'Unknown Business'
      );
    });
    
    // Get all campaigns
    const campaignsCollection = db.collection('campaigns');
    const campaigns = await campaignsCollection.find({}).toArray();
    
    console.log(`Found ${campaigns.length} campaigns`);
    
    // Update each campaign with the company name
    const updates = [];
    for (const campaign of campaigns) {
      if (campaign.businessId) {
        const businessId = campaign.businessId.toString();
        const companyName = businessMap.get(businessId);
        
        if (companyName && (!campaign.companyName || campaign.companyName !== companyName)) {
          console.log(`Updating campaign ${campaign._id} with company name: ${companyName}`);
          
          const result = await campaignsCollection.updateOne(
            { _id: campaign._id },
            { $set: { companyName: companyName } }
          );
          
          updates.push({
            campaignId: campaign._id.toString(),
            businessId: businessId,
            companyName: companyName,
            updated: result.modifiedCount > 0
          });
        }
      }
    }
    
    return NextResponse.json({
      message: `Updated ${updates.length} campaigns with company information`,
      updates
    });
  } catch (error) {
    console.error('Error updating campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 