import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { campaignId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'referrer') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { campaignId } = params;
    
    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }
    
    // Get the referrer's ID from the session
    const referrerId = session.user.id;
    
    // Connect to the database
    console.log('Connecting to database to fetch campaign details...');
    const db = await connectToDatabase();
    console.log('Connected to database');
    
    // First, get the referrer's details to find their associated companies
    const referrersCollection = db.collection('users');
    const referrer = await referrersCollection.findOne({ 
      _id: new ObjectId(referrerId),
      role: 'referrer'
    });
    
    if (!referrer) {
      return NextResponse.json(
        { error: 'Referrer not found' },
        { status: 404 }
      );
    }
    
    // Get the referrer's associated companies (if any)
    const associatedCompanies = referrer.associatedCompanies || [];
    
    // If the referrer has no associated companies, check if they have a default company
    if (associatedCompanies.length === 0 && referrer.defaultCompanyId) {
      associatedCompanies.push(referrer.defaultCompanyId);
    }
    
    // Convert string IDs to ObjectId
    const companyObjectIds = associatedCompanies.map((id: string | ObjectId) => 
      typeof id === 'string' ? new ObjectId(id) : id
    );
    
    // Get the campaign
    const campaignsCollection = db.collection('campaigns');
    const campaign = await campaignsCollection.findOne({
      _id: new ObjectId(campaignId)
    });
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    // Check if the campaign belongs to one of the referrer's associated companies
    // or if the referrer has already selected this campaign
    const referrerCampaignsCollection = db.collection('referrerCampaigns');
    const isSelected = await referrerCampaignsCollection.findOne({
      referrerId: referrerId,
      campaignId: new ObjectId(campaignId)
    });
    
    const isAssociatedCompany = companyObjectIds.length > 0 && 
      companyObjectIds.some(id => campaign.businessId === id.toString());
    
    if (!isSelected && !isAssociatedCompany) {
      return NextResponse.json(
        { error: 'You do not have access to this campaign' },
        { status: 403 }
      );
    }
    
    // Get the business details
    const businessesCollection = db.collection('users');
    const business = await businessesCollection.findOne({
      _id: new ObjectId(campaign.businessId),
      role: 'business'
    });
    
    // Add business name to the campaign
    const campaignWithBusinessName = {
      ...campaign,
      businessName: business?.businessName || business?.name || 'Unknown Business',
      isSelected: !!isSelected
    };
    
    return NextResponse.json(campaignWithBusinessName);
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 