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

    if (!businessId) {
      return NextResponse.json<ErrorResponse>(
        { error: "Business ID is required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const campaigns = await db.collection<Campaign>("campaigns")
      .find({ businessId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(campaigns);
  } catch (err) {
    console.error("Error fetching campaigns:", err);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

// POST - Create a new campaign
export async function POST(request: Request) {
  try {
    const body = await request.json() as CampaignRequest;

    if (!body.businessId || !body.title || !body.description) {
      return NextResponse.json<ErrorResponse>(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const result = await db.collection<Campaign>("campaigns").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const campaign = await db.collection<Campaign>("campaigns").findOne({
      _id: result.insertedId,
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (err) {
    console.error("Error creating campaign:", err);
    return NextResponse.json<ErrorResponse>(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
} 