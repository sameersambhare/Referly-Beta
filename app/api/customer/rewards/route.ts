import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/mongodb"
import Reward from "@/models/Reward"
import User from "@/models/User"
import Campaign from "@/models/Campaign"

export async function GET(req: Request) {
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
        { error: "Only customers can view their rewards" },
        { status: 403 }
      )
    }

    // Connect to the database
    await connectToDatabase()

    // Find all rewards for the customer
    const rewards = await Reward.find({ userId: session.user.id })
      .sort({ dateEarned: -1 })
      .lean()

    // If no rewards found, return empty array
    if (!rewards || rewards.length === 0) {
      return NextResponse.json([])
    }

    // Get all business IDs and campaign IDs from rewards
    const businessIds = [...new Set(rewards.map(reward => reward.businessId))]
    const campaignIds = [...new Set(rewards.map(reward => reward.campaignId))]

    // Fetch business and campaign details
    const businesses = await User.find({ _id: { $in: businessIds } })
      .select("name businessName companyName")
      .lean()

    const campaigns = await Campaign.find({ _id: { $in: campaignIds } })
      .select("name companyName")
      .lean()

    // Create a map of business IDs to business names
    const businessMap = businesses.reduce((map, business) => {
      map[business._id.toString()] = business.businessName || business.companyName || business.name || "Unknown Business"
      return map
    }, {} as Record<string, string>)

    // Create a map of campaign IDs to campaign names
    const campaignMap = campaigns.reduce((map, campaign) => {
      map[campaign._id.toString()] = campaign.name || "Unknown Campaign"
      return map
    }, {} as Record<string, string>)

    // Enrich rewards with business and campaign names
    const enrichedRewards = rewards.map(reward => ({
      ...reward,
      businessName: businessMap[reward.businessId.toString()],
      campaignName: campaignMap[reward.campaignId.toString()]
    }))

    return NextResponse.json(enrichedRewards)
  } catch (error) {
    console.error("Error fetching rewards:", error)
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    )
  }
} 