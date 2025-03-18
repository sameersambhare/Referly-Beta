import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/options"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "referrer") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Get the referrer's ID from the session
    const referrerId = session.user.id
    
    // Get request body
    const body = await request.json()
    const { campaignId } = body
    
    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      )
    }
    
    // Connect to the database
    console.log("Connecting to database to select campaign...")
    const db = await connectToDatabase()
    console.log("Connected to database")
    
    // Verify the campaign exists
    const campaignsCollection = db.collection("campaigns")
    const campaign = await campaignsCollection.findOne({
      _id: new ObjectId(campaignId),
      isActive: true
    })
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found or not active" },
        { status: 404 }
      )
    }
    
    // Check if the referrer has already selected this campaign
    const referrerCampaignsCollection = db.collection("referrerCampaigns")
    const existingSelection = await referrerCampaignsCollection.findOne({
      referrerId: referrerId,
      campaignId: new ObjectId(campaignId)
    })
    
    if (existingSelection) {
      return NextResponse.json(
        { message: "Campaign already selected" }
      )
    }
    
    // Create a new referrer-campaign association
    const result = await referrerCampaignsCollection.insertOne({
      referrerId: referrerId,
      campaignId: new ObjectId(campaignId),
      businessId: campaign.businessId,
      selectedAt: new Date(),
      referrals: [],
      status: "active"
    })
    
    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Failed to select campaign" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: "Campaign selected successfully",
      id: result.insertedId
    })
  } catch (error) {
    console.error("Error selecting campaign:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 