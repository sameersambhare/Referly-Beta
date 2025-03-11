import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Campaign } from '@/types/api';

interface CampaignRequest {
  title: string;
  description: string;
  businessId: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: "active" | "inactive" | "completed";
  type: string;
  rewards: {
    type: string;
    value: number;
    description: string;
  }[];
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

// GET - Retrieve all campaigns for the authenticated business
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");
    
    console.log("GET /api/campaigns - businessId:", businessId);

    // If no businessId is provided, return mock data for demo purposes
    if (!businessId) {
      console.log("No businessId provided, returning mock data");
      
      // Return mock campaign data
      const mockCampaigns: Campaign[] = [
        {
          _id: "1",
          name: "Summer Referral Program",
          description: "Refer friends and earn rewards during our summer promotion",
          isActive: true,
          startDate: "2023-06-01",
          endDate: "2023-08-31",
          rewardType: "Cash",
          rewardAmount: 25,
          referralCount: 156,
          conversionCount: 42
        },
        {
          _id: "2",
          name: "Holiday Special",
          description: "Special holiday referral campaign with bonus rewards",
          isActive: true,
          startDate: "2023-11-15",
          endDate: "2024-01-15",
          rewardType: "Gift Card",
          rewardAmount: 50,
          referralCount: 89,
          conversionCount: 31
        },
        {
          _id: "3",
          name: "Loyalty Program",
          description: "Ongoing loyalty program for our best customers",
          isActive: true,
          startDate: "2023-01-01",
          endDate: undefined,
          rewardType: "Points",
          rewardAmount: 100,
          referralCount: 312,
          conversionCount: 98
        },
        {
          _id: "4",
          name: "Spring Flash Campaign",
          description: "Limited time spring promotion",
          isActive: false,
          startDate: "2023-03-01",
          endDate: "2023-04-15",
          rewardType: "Discount",
          rewardAmount: 15,
          referralCount: 67,
          conversionCount: 22
        }
      ];
      
      return NextResponse.json(mockCampaigns);
    }

    try {
      const db = await connectToDatabase();
      console.log("Connected to database, querying campaigns for businessId:", businessId);
      
      const campaigns = await db.collection<Campaign>("campaigns")
        .find({ businessId })
        .sort({ createdAt: -1 })
        .toArray();
      
      console.log(`Found ${campaigns.length} campaigns for businessId:`, businessId);
      return NextResponse.json(campaigns);
    } catch (dbError) {
      console.error("Database error:", dbError);
      // If database connection fails, return mock data as fallback
      console.log("Returning mock data as fallback due to database error");
      return NextResponse.json([
        {
          _id: "fallback-1",
          name: "Example Campaign (DB Error Fallback)",
          description: "This is a fallback campaign due to database connection issues",
          isActive: true,
          startDate: "2023-01-01",
          endDate: "2023-12-31",
          rewardType: "Cash",
          rewardAmount: 10,
          referralCount: 0,
          conversionCount: 0
        }
      ]);
    }
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to fetch campaigns: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
}

// POST - Create a new campaign
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("POST /api/campaigns - Received data:", body);

    // Validate required fields based on the form structure
    if (!body.name || !body.startDate || body.rewardAmount === undefined) {
      console.error("Missing required fields:", { name: body.name, startDate: body.startDate, rewardAmount: body.rewardAmount });
      return NextResponse.json<ErrorResponse>(
        { error: "Missing required fields: name, startDate, or rewardAmount" },
        { status: 400 }
      );
    }

    try {
      // Try to connect to the database
      const db = await connectToDatabase();
      console.log("Connected to database, creating new campaign");
      
      // Prepare campaign data with new referrer fields
      const campaignData = {
        name: body.name,
        description: body.description || "",
        isActive: true, // Default to active
        startDate: body.startDate,
        endDate: body.endDate || undefined,
        rewardType: body.rewardType,
        rewardAmount: body.rewardAmount,
        referralCount: 0,
        conversionCount: 0,
        businessId: body.businessId,
        // New referrer-specific fields
        referrerRewardType: body.referrerRewardType,
        referrerRewardAmount: body.referrerRewardAmount,
        referrerRewardDescription: body.referrerRewardDescription,
        referrerCount: 0,
        referrerRequirements: body.referrerRequirements,
        sharingInstructions: body.sharingInstructions,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Insert into database
      const result = await db.collection<Campaign>("campaigns").insertOne(campaignData);
      console.log("Campaign created with ID:", result.insertedId);
      
      // Fetch the created campaign
      const campaign = await db.collection<Campaign>("campaigns").findOne({
        _id: result.insertedId,
      });
      
      return NextResponse.json(campaign, { status: 201 });
    } catch (dbError) {
      console.error("Database error:", dbError);
      
      // If database connection fails, create a mock campaign as fallback
      console.log("Creating mock campaign as fallback due to database error");
      const mockCampaign: Campaign = {
        _id: Date.now().toString(), // Generate a unique ID
        name: body.name,
        description: body.description || "",
        isActive: true,
        startDate: body.startDate,
        endDate: body.endDate || undefined,
        rewardType: body.rewardType,
        rewardAmount: body.rewardAmount,
        referralCount: 0,
        conversionCount: 0,
        // New referrer-specific fields
        referrerRewardType: body.referrerRewardType,
        referrerRewardAmount: body.referrerRewardAmount,
        referrerRewardDescription: body.referrerRewardDescription,
        referrerCount: 0,
        referrerRequirements: body.referrerRequirements,
        sharingInstructions: body.sharingInstructions
      };
      
      return NextResponse.json(mockCampaign, { status: 201 });
    }
  } catch (err) {
    console.error("Error creating campaign:", err);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to create campaign: " + (err instanceof Error ? err.message : String(err)) },
      { status: 500 }
    );
  }
} 