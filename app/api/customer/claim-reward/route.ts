import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Get user ID from session
    const userId = session.user.id
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { rewardId } = body
    
    if (!rewardId) {
      return NextResponse.json(
        { error: "Reward ID is required" },
        { status: 400 }
      )
    }
    
    console.log(`User ${userId} is claiming reward: ${rewardId}`)
    
    // Connect to database
    const db = await connectToDatabase()
    
    // Find the reward
    const reward = await db.collection("rewards").findOne({
      _id: new ObjectId(rewardId),
      userId: new ObjectId(userId),
      claimable: true,
      status: "pending"
    })
    
    if (!reward) {
      return NextResponse.json(
        { error: "Reward not found or not claimable" },
        { status: 404 }
      )
    }
    
    // Get campaign details
    const campaign = await db.collection("campaigns").findOne({
      _id: reward.campaignId
    })
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }
    
    // Get business details
    const business = await db.collection("users").findOne({
      _id: campaign.businessId,
      role: "business"
    })
    
    if (!business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      )
    }
    
    // Update reward status
    await db.collection("rewards").updateOne(
      { _id: new ObjectId(rewardId) },
      { 
        $set: { 
          status: "claimed",
          dateRedeemed: new Date()
        }
      }
    )
    
    // Update campaign metrics
    await db.collection("campaigns").updateOne(
      { _id: campaign._id },
      { $inc: { redemptions: 1 } }
    )
    
    // Generate redemption URL
    let redemptionUrl = business.website || "";
    
    // Add query parameters if website exists
    if (redemptionUrl) {
      const separator = redemptionUrl.includes("?") ? "&" : "?";
      redemptionUrl = `${redemptionUrl}${separator}reward_code=${reward.code}&reward_type=${reward.type}&reward_amount=${reward.amount}`;
    }
    
    return NextResponse.json({
      message: "Reward claimed successfully!",
      redemptionUrl: redemptionUrl,
      businessName: business.businessName || business.name || "Unknown Business",
      reward: {
        type: reward.type,
        amount: reward.amount,
        code: reward.code
      }
    })
    
  } catch (error) {
    console.error("Error claiming reward:", error)
    return NextResponse.json(
      { error: "Failed to claim reward" },
      { status: 500 }
    )
  }
} 