import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be signed in to generate a referral link" },
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
    const { campaignId, customMessage } = body
    
    if (!campaignId) {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      )
    }
    
    // Connect to database
    const { db } = await connectToDatabase()
    
    // Verify campaign exists
    const campaign = await db.collection("campaigns").findOne({
      _id: new ObjectId(campaignId)
    })
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }
    
    // Verify user has access to this campaign
    const referrer = await db.collection("referrers").findOne({
      _id: new ObjectId(userId),
      campaigns: { $in: [new ObjectId(campaignId)] }
    })
    
    if (!referrer) {
      return NextResponse.json(
        { error: "You don't have access to this campaign" },
        { status: 403 }
      )
    }
    
    // Generate a unique referral code
    const referralCode = crypto.randomBytes(6).toString("hex")
    
    // Create referral link record
    const referralLink = {
      code: referralCode,
      referrerId: new ObjectId(userId),
      campaignId: new ObjectId(campaignId),
      customMessage: customMessage || null,
      createdAt: new Date(),
      clicks: 0,
      conversions: 0,
      active: true
    }
    
    // Save to database
    const result = await db.collection("referralLinks").insertOne(referralLink)
    
    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Failed to create referral link" },
        { status: 500 }
      )
    }
    
    // Construct the full referral link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const fullReferralLink = `${baseUrl}/r/${referralCode}`
    
    return NextResponse.json({
      success: true,
      referralLink: fullReferralLink,
      code: referralCode
    })
    
  } catch (error) {
    console.error("Error generating referral link:", error)
    return NextResponse.json(
      { error: "Failed to generate referral link" },
      { status: 500 }
    )
  }
} 