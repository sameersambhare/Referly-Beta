import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Connect to database
    const db = await connectToDatabase()
    
    // Get the user to find their associated business
    const user = await db.collection("users").findOne({ 
      _id: new ObjectId(userId) 
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get the business ID from the user
    const businessId = user.businessId

    if (!businessId) {
      return NextResponse.json(
        { error: "No associated business found for this referrer" },
        { status: 404 }
      )
    }

    // Find active campaigns from the user's associated business
    const campaigns = await db.collection("campaigns").find({
      businessId: businessId.toString(),
      isActive: true,
      startDate: { $lte: new Date() },
      $or: [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gt: new Date() } }
      ],
      // Make sure the campaign has referrer rewards set up
      referrerRewardAmount: { $exists: true, $ne: null }
    }).sort({ createdAt: -1 }).toArray()

    // Get user's selected campaigns
    const selectedCampaignIds = user.selectedCampaigns || []

    // Add a flag to indicate if the user has already selected each campaign
    const campaignsWithSelection = campaigns.map(campaign => ({
      ...campaign,
      isSelected: selectedCampaignIds.includes(campaign._id.toString())
    }))

    return NextResponse.json(campaignsWithSelection)
  } catch (error) {
    console.error("Error fetching referrer campaigns:", error)
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    )
  }
} 