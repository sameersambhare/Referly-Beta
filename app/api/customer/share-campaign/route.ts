import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/mongodb"
import Campaign from "@/models/Campaign"
import User from "@/models/User"
import Reward from "@/models/Reward"

export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user is a customer
    if (session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Only customers can share campaigns" },
        { status: 403 }
      )
    }

    // Get the campaign ID and share method from the request body
    const { campaignId, shareMethod } = await req.json()
    if (!campaignId || !shareMethod) {
      return NextResponse.json(
        { error: "Campaign ID and share method are required" },
        { status: 400 }
      )
    }

    // Connect to the database
    await connectToDatabase()

    // Find the campaign
    const campaign = await Campaign.findById(campaignId)
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }

    // Check if the campaign is active
    if (!campaign.isActive) {
      return NextResponse.json(
        { error: "This campaign is no longer active" },
        { status: 400 }
      )
    }

    // Find the customer
    const customer = await User.findById(session.user.id)
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }

    // Create a new reward for the customer
    const reward = new Reward({
      userId: session.user.id,
      campaignId: campaignId,
      businessId: campaign.businessId,
      type: campaign.customerRewardType,
      amount: campaign.customerRewardAmount,
      status: "pending",
      shareMethod: shareMethod,
      dateEarned: new Date(),
      dateRedeemed: null,
      description: `Reward for sharing ${campaign.name} campaign via ${shareMethod}`
    })

    await reward.save()

    // Update campaign metrics
    await Campaign.findByIdAndUpdate(campaignId, {
      $inc: {
        shares: 1,
        impressions: 1
      }
    })

    return NextResponse.json({
      message: "Campaign shared successfully!",
      reward: {
        id: reward._id,
        type: reward.type,
        amount: reward.amount,
        status: reward.status
      }
    })
  } catch (error) {
    console.error("Error sharing campaign:", error)
    return NextResponse.json(
      { error: "Failed to share campaign" },
      { status: 500 }
    )
  }
} 