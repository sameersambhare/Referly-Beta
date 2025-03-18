import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
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
    
    // Connect to database
    const db = await connectToDatabase()
    
    // Find all rewards for this customer
    const rewards = await db.collection("rewards")
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId)
          }
        },
        {
          $lookup: {
            from: "campaigns",
            localField: "campaignId",
            foreignField: "_id",
            as: "campaign"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "businessId",
            foreignField: "_id",
            as: "business"
          }
        },
        {
          $unwind: {
            path: "$campaign",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: {
            path: "$business",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 1,
            type: 1,
            amount: 1,
            status: 1,
            description: 1,
            code: 1,
            dateEarned: 1,
            dateRedeemed: 1,
            expiryDate: 1,
            campaignName: "$campaign.name",
            businessName: "$business.name",
            campaignId: 1,
            businessId: 1
          }
        },
        {
          $sort: {
            dateEarned: -1
          }
        }
      ])
      .toArray()
    
    // Check for expired rewards and update their status
    const now = new Date()
    const expiredRewards = rewards.filter(reward => 
      reward.status === "available" && 
      reward.expiryDate && 
      new Date(reward.expiryDate) < now
    )
    
    if (expiredRewards.length > 0) {
      const expiredIds = expiredRewards.map(reward => new ObjectId(reward._id))
      await db.collection("rewards").updateMany(
        { _id: { $in: expiredIds } },
        { $set: { status: "expired" } }
      )
      
      // Update the rewards array with expired status
      rewards.forEach(reward => {
        if (expiredIds.some(id => id.toString() === reward._id)) {
          reward.status = "expired"
        }
      })
    }
    
    return NextResponse.json({ rewards })
    
  } catch (error) {
    console.error("Error fetching rewards:", error)
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    )
  }
} 