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
      type: campaign.rewardType || "discount",
      amount: campaign.rewardAmount || 0,
      status: "pending",
      dateEarned: new Date(),
      dateRedeemed: null,
      description: `Reward for completing ${campaign.name} campaign referral`,
      claimable: true,
      code: generateRewardCode()
    }
    
    await db.collection("rewards").insertOne(customerReward)
    
    // Create reward for the referrer
    const referrerReward = {
      userId: referralLink.customerId, // The customer who shared the link
      campaignId: campaign._id,
      businessId: campaign.businessId,
      type: campaign.referrerRewardType || campaign.rewardType || "discount",
      amount: campaign.referrerRewardAmount || campaign.rewardAmount || 0,
      status: "pending",
      dateEarned: new Date(),
      dateRedeemed: null,
      description: `Reward for successful referral of ${campaign.name} campaign`,
      claimable: true,
      code: generateRewardCode()
    }
    
    await db.collection("rewards").insertOne(referrerReward)
    
    // Add this customer to the referrer's successful referrals
    await db.collection("users").updateOne(
      { _id: referralLink.customerId },
      { 
        $addToSet: { 
          successfulReferrals: new ObjectId(userId)
        }
      }
    )
    
    return NextResponse.json({
      message: "Referral completed successfully!",
      reward: {
        type: customerReward.type,
        amount: customerReward.amount,
        code: customerReward.code
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