import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/mongodb"
import Campaign from "@/models/Campaign"
import User from "@/models/User"

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
        { error: "Only customers can process referral links" },
        { status: 403 }
      )
    }

    // Get the referral link from the request body
    const { referralLink } = await req.json()
    if (!referralLink) {
      return NextResponse.json(
        { error: "Referral link is required" },
        { status: 400 }
      )
    }

    // Extract the campaign ID from the referral link
    // Format: https://referly.com/r/{campaignId}?ref={referrerId}
    const url = new URL(referralLink)
    const pathParts = url.pathname.split('/')
    const campaignId = pathParts[pathParts.length - 1]
    const referrerId = url.searchParams.get('ref')

    if (!campaignId) {
      return NextResponse.json(
        { error: "Invalid referral link format" },
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

    // Find the referrer if referrerId is provided
    let referrer = null
    if (referrerId) {
      referrer = await User.findById(referrerId)
      if (!referrer) {
        return NextResponse.json(
          { error: "Referrer not found" },
          { status: 404 }
        )
      }
    }

    // Return the campaign details
    return NextResponse.json({
      _id: campaign._id,
      name: campaign.name,
      description: campaign.description,
      businessName: campaign.companyName || "Unknown Business",
      companyName: campaign.companyName,
      rewardType: campaign.customerRewardType,
      rewardAmount: campaign.customerRewardAmount,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      isActive: campaign.isActive,
      referrerId: referrerId
    })
  } catch (error) {
    console.error("Error processing referral link:", error)
    return NextResponse.json(
      { error: "Failed to process referral link" },
      { status: 500 }
    )
  }
} 