import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Unauthorized. You must be signed in as a customer." },
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
    
    // Get reward ID from params
    const rewardId = params.id
    
    if (!rewardId) {
      return NextResponse.json(
        { error: "Reward ID is required" },
        { status: 400 }
      )
    }
    
    // Connect to database
    const db = await connectToDatabase()
    
    // Find the reward
    const reward = await db.collection("rewards").findOne({
      _id: new ObjectId(rewardId),
      userId: new ObjectId(userId)
    })
    
    if (!reward) {
      return NextResponse.json(
        { error: "Reward not found" },
        { status: 404 }
      )
    }
    
    // Check if reward is available
    if (reward.status !== "available") {
      return NextResponse.json(
        { error: "This reward is not available for redemption" },
        { status: 400 }
      )
    }
    
    // Check if reward is expired
    if (reward.expiryDate && new Date(reward.expiryDate) < new Date()) {
      return NextResponse.json(
        { error: "This reward has expired" },
        { status: 400 }
      )
    }
    
    // Update reward status to redeemed
    const result = await db.collection("rewards").updateOne(
      { _id: new ObjectId(rewardId) },
      {
        $set: {
          status: "redeemed",
          dateRedeemed: new Date()
        }
      }
    )
    
    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Failed to redeem reward" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: "Reward redeemed successfully",
      reward: {
        ...reward,
        status: "redeemed",
        dateRedeemed: new Date()
      }
    })
    
  } catch (error) {
    console.error("Error redeeming reward:", error)
    return NextResponse.json(
      { error: "Failed to redeem reward" },
      { status: 500 }
    )
  }
} 