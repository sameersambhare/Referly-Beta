import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/mongodb"
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
    const { referralCode } = body
    
    if (!referralCode) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      )
    }
    
    console.log(`Customer ${userId} is completing referral with code: ${referralCode}`)
    
    // Connect to database
    const db = await connectToDatabase()
    
    // Find the referral link
    const referralLink = await db.collection("referralLinks").findOne({
      code: referralCode,
      active: true
    })
    
    if (!referralLink) {
      return NextResponse.json(
        { error: "Invalid or expired referral link" },
        { status: 404 }
      )
    }

    // Check if this customer is trying to use their own referral link
    if (referralLink.customerId.toString() === userId) {
      return NextResponse.json(
        { error: "You cannot use your own referral link" },
        { status: 400 }
      )
    }
    
    // Find the conversion record
    const conversion = await db.collection("conversions").findOne({
      referralLinkId: referralLink._id,
      customerId: new ObjectId(userId)
    })
    
    if (!conversion) {
      return NextResponse.json(
        { error: "No conversion record found for this referral" },
        { status: 404 }
      )
    }
    
    if (conversion.status === "completed") {
      return NextResponse.json(
        { error: "This referral has already been completed" },
        { status: 400 }
      )
    }
    
    // Get campaign details
    const campaign = await db.collection("campaigns").findOne({
      _id: referralLink.campaignId
    })
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }
    
    // Update conversion status
    await db.collection("conversions").updateOne(
      { _id: conversion._id },
      { 
        $set: { 
          status: "completed",
          updatedAt: new Date()
        }
      }
    )
    
    // Update referral link metrics
    await db.collection("referralLinks").updateOne(
      { _id: referralLink._id },
      { $inc: { conversions: 1 } }
    )
    
    // Update campaign metrics
    await db.collection("campaigns").updateOne(
      { _id: campaign._id },
      { $inc: { conversions: 1 } }
    )
    
    // Create reward for the customer (person who clicked the link)
    const customerReward = {
      userId: new ObjectId(userId),
      campaignId: campaign._id,
      businessId: campaign.businessId,
      type: campaign.customerRewardType || "discount",
      amount: campaign.customerRewardAmount || 0,
      status: "active",
      dateEarned: new Date(),
      dateRedeemed: null,
      description: `Reward for completing ${campaign.name} campaign referral`,
      claimable: true,
      code: generateRewardCode(),
      referralCode: referralCode
    }
    
    const customerRewardResult = await db.collection("rewards").insertOne(customerReward)
    
    // Activate the referrer's reward that was created during sharing
    const referrerRewardResult = await db.collection("rewards").updateOne(
      { 
        userId: referralLink.customerId,
        campaignId: campaign._id,
        status: "pending"
      },
      { 
        $set: { 
          status: "active",
          claimable: true,
          dateActivated: new Date(),
          referralCompletedBy: new ObjectId(userId)
        }
      }
    )
    
    // Add this customer to the referrer's successful referrals
    await db.collection("users").updateOne(
      { _id: referralLink.customerId },
      { 
        $addToSet: { 
          successfulReferrals: {
            userId: new ObjectId(userId),
            campaignId: campaign._id,
            date: new Date(),
            rewardId: customerRewardResult.insertedId
          }
        }
      }
    )
    
    return NextResponse.json({
      message: "Referral completed successfully!",
      reward: {
        id: customerRewardResult.insertedId.toString(),
        type: customerReward.type,
        amount: customerReward.amount,
        code: customerReward.code,
        status: customerReward.status,
        claimable: customerReward.claimable
      }
    })
    
  } catch (error) {
    console.error("Error completing referral:", error)
    return NextResponse.json(
      { error: "Failed to complete referral" },
      { status: 500 }
    )
  }
}

// Helper function to generate a reward code
function generateRewardCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing characters
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
} 