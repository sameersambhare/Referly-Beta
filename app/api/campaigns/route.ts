import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/options";
import { ObjectId } from "mongodb";

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
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "business") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const businessId = session.user.id;
    console.log(`GET /api/campaigns - businessId: ${businessId}`);
    
    const db = await connectToDatabase();
    console.log(`Connected to database, querying campaigns for businessId: ${businessId}`);
    
    const campaigns = await db.collection("campaigns")
      .find({ businessId })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log(`Found ${campaigns.length} campaigns for businessId: ${businessId}`);
    
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

// POST - Create a new campaign
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "business") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const businessId = session.user.id;
    const data = await request.json();
    
    console.log(`POST /api/campaigns - Received data:`, data);
    
    // Validate required fields
    if (!data.name || !data.startDate || !data.rewardType || !data.rewardAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    console.log("Connected to database, creating new campaign");
    
    // Get business details to add company name to campaign
    const business = await db.collection("users").findOne({
      _id: new ObjectId(businessId)
    });
    
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }
    
    // Get business name from the business document
    const businessName = business.businessName || business.name || "Unknown Business";
    
    // Create the campaign
    const campaign = {
      ...data,
      businessId,
      companyName: businessName,
      isActive: true,
      referralCount: 0,
      conversionCount: 0,
      referrerCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection("campaigns").insertOne(campaign);
    console.log(`Campaign created with ID: ${result.insertedId}`);
    
    // Update the business user to add this campaign to their campaigns array
    await db.collection("users").updateOne(
      { _id: new ObjectId(businessId) },
      { $addToSet: { campaigns: result.insertedId } }
    );
    console.log(`Added campaign ${result.insertedId} to business ${businessId} campaigns array`);
    
    return NextResponse.json({
      id: result.insertedId,
      ...campaign
    });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
} 