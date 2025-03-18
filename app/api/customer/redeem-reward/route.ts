import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/options"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is authenticated and is a customer
    if (!session || session.user.role !== "customer") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const customerId = session.user.id
    const { rewardId } = await request.json()
    
    if (!rewardId) {
      return NextResponse.json(
        { error: "Reward ID is required" },
        { status: 400 }
      )
    }
    
    console.log(`Customer ${customerId} redeeming reward ${rewardId}`)
    
    // Connect to the database
    const db = await connectToDatabase()
    
    // Find the reward
    const rewardsCollection = db.collection("rewards")
    const reward = await rewardsCollection.findOne({
      $or: [
        { _id: new ObjectId(rewardId) },
        { _id: rewardId }
      ],
      customerId: customerId,
      status: "available"
    })
    
    if (!reward) {
      return NextResponse.json(
        { error: "Reward not found or not available" },
        { status: 404 }
      )
    }
    
    // Update the reward status
    const result = await rewardsCollection.updateOne(
      { _id: reward._id },
      {
        $set: {
          status: "redeemed",
          redeemedDate: new Date()
        }
      }
    )
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: "Failed to redeem reward" },
        { status: 500 }
      )
    }
    
    // Update campaign stats
    const campaignsCollection = db.collection("campaigns")
    await campaignsCollection.updateOne(
      { _id: new ObjectId(reward.campaignId) },
      {
        $inc: {
          redemptionCount: 1
        }
      }
    )
    
    // Get the updated reward
    const updatedReward = await rewardsCollection.findOne({ _id: reward._id })
    
    // Notify the business about the redemption (in a real implementation)
    // This could be done via email, push notification, or adding to a notifications collection
    
    return NextResponse.json({
      success: true,
      message: "Reward redeemed successfully",
      reward: updatedReward
    })
    
  } catch (error) {
    console.error("Error redeeming reward:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}