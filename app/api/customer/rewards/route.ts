import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
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
    
    // Get query parameters
    const url = new URL(request.url)
    const status = url.searchParams.get("status") // pending, claimed, all
    
    console.log(`Fetching rewards for user ${userId} with status: ${status || 'all'}`)
    
    // Connect to database
    const db = await connectToDatabase()
    
    // Build query
    const query: any = {
      userId: new ObjectId(userId),
      claimable: true
    }
    
    // Add status filter if provided
    if (status && status !== "all") {
      query.status = status
    }
    
    // Find rewards
    const rewards = await db.collection("rewards").find(query)
      .sort({ dateEarned: -1 })
      .toArray()
    
    console.log(`Found ${rewards.length} rewards`)
    
    // Get campaign details for each reward
    const campaignIds = [...new Set(rewards.map(reward => 
      reward.campaignId instanceof ObjectId 
        ? reward.campaignId 
        : new ObjectId(reward.campaignId)
    ))]
    
    const campaigns = await db.collection("campaigns").find({
      _id: { $in: campaignIds }
    }).toArray()
    
    // Get business details for each campaign
    const businessIds = [...new Set(campaigns.map(campaign => 
      campaign.businessId instanceof ObjectId 
        ? campaign.businessId 
        : new ObjectId(campaign.businessId)
    ))]
    
    const businesses = await db.collection("users").find({
      _id: { $in: businessIds },
      role: "business"
    }).toArray()
    
    // Map additional details to rewards
    const rewardsWithDetails = rewards.map(reward => {
      const campaign = campaigns.find(c => c._id.toString() === reward.campaignId.toString())
      const business = campaign 
        ? businesses.find(b => b._id.toString() === campaign.businessId.toString())
        : null
      
      return {
        ...reward,
        _id: reward._id.toString(),
        campaignName: campaign?.name || "Unknown Campaign",
        businessName: business?.businessName || business?.name || "Unknown Business",
        campaignId: reward.campaignId.toString(),
        userId: reward.userId.toString(),
        businessId: reward.businessId.toString()
      }
    })
    
    return NextResponse.json(rewardsWithDetails)
    
  } catch (error) {
    console.error("Error fetching rewards:", error)
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    )
  }
} 