import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
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
    
    // Parse request body
    const body = await request.json()
    const { campaignId, shareMethod } = body
    
    if (!campaignId || !shareMethod) {
      return NextResponse.json(
        { error: "Campaign ID and share method are required" },
        { status: 400 }
      )
    }
    
    console.log(`Customer ${userId} is sharing campaign ${campaignId} via ${shareMethod}`)
    
    // Connect to database
    const db = await connectToDatabase()
    
    // Find the campaign
    const campaign = await db.collection("campaigns").findOne({
      _id: new ObjectId(campaignId),
      isActive: true
    })
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found or not active" },
        { status: 404 }
      )
    }
    
    console.log(`Found campaign: ${campaign.name}`)
    
    // Find the customer
    const customer = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      role: "customer"
    })
    
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      )
    }
    
    // Create a new reward for the customer for sharing
    const reward = {
      userId: new ObjectId(userId),
      campaignId: new ObjectId(campaignId),
      businessId: campaign.businessId,
      type: campaign.rewardType || "discount",
      amount: campaign.rewardAmount || 0,
      status: "pending",
      shareMethod: shareMethod,
      dateEarned: new Date(),
      dateRedeemed: null,
      description: `Reward for sharing ${campaign.name} campaign via ${shareMethod}`,
      claimable: false // Only claimable after successful referral completion
    }
    
    const rewardResult = await db.collection("rewards").insertOne(reward)
    
    if (!rewardResult.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create reward" },
        { status: 500 }
      )
    }
    
    // Update campaign metrics
    await db.collection("campaigns").updateOne(
      { _id: new ObjectId(campaignId) },
      { 
        $inc: { 
          shares: 1,
          impressions: 1
        }
      }
    )
    
    // Generate a unique referral code for this customer
    const crypto = require('crypto')
    const referralCode = crypto.randomBytes(6).toString("hex")
    
    // Create a referral link record
    const referralLink = {
      code: referralCode,
      customerId: new ObjectId(userId),
      campaignId: new ObjectId(campaignId),
      shareMethod: shareMethod,
      createdAt: new Date(),
      clicks: 0,
      conversions: 0,
      active: true
    }
    
    const referralResult = await db.collection("referralLinks").insertOne(referralLink)
    
    if (!referralResult.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create referral link" },
        { status: 500 }
      )
    }
    
    // Construct the full referral link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const fullReferralLink = `${baseUrl}/r/${referralCode}`
    
    return NextResponse.json({
      message: "Campaign shared successfully!",
      referralLink: fullReferralLink,
      code: referralCode,
      reward: {
        id: rewardResult.insertedId.toString(),
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