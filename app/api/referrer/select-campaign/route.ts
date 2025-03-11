import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import { z } from "zod"
import { ObjectId } from "mongodb"

const selectCampaignSchema = z.object({
  campaignId: z.string(),
  userId: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate request body
    const validationResult = selectCampaignSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { campaignId, userId } = validationResult.data

    // Connect to database
    const db = await connectToDatabase()

    // Get the user and campaign
    const user = await db.collection("users").findOne({ 
      _id: new ObjectId(userId) 
    })

    const campaign = await db.collection("campaigns").findOne({ 
      _id: new ObjectId(campaignId) 
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    // Verify the campaign belongs to the user's associated business
    if (!user.businessId || campaign.businessId.toString() !== user.businessId.toString()) {
      return NextResponse.json(
        { error: "Unauthorized to select this campaign. It does not belong to your company." },
        { status: 403 }
      )
    }

    // Verify campaign is active
    if (!campaign.isActive) {
      return NextResponse.json(
        { error: "Campaign is not active" },
        { status: 400 }
      )
    }

    // Check if user already has selectedCampaigns array
    const userSelectedCampaigns = user.selectedCampaigns || []
    
    // Only update if campaign is not already selected
    if (!userSelectedCampaigns.includes(campaignId)) {
      // Update user document with the new selected campaign
      const updateResult = await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { selectedCampaigns: campaignId } }
      )

      // Increment referrer count on campaign
      if (updateResult.modifiedCount > 0) {
        await db.collection("campaigns").updateOne(
          { _id: new ObjectId(campaignId) },
          { $inc: { referrerCount: 1 } }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Campaign selected successfully"
    })
  } catch (error) {
    console.error("Error selecting campaign:", error)
    return NextResponse.json(
      { error: "Failed to select campaign" },
      { status: 500 }
    )
  }
} 