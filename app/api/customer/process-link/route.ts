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
    let { referralLink, code } = body
    
    // Extract code from referral link if provided
    if (referralLink && !code) {
      const url = new URL(referralLink)
      const pathParts = url.pathname.split('/')
      code = pathParts[pathParts.length - 1]
    }
    
    if (!code) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      )
    }
    
    console.log(`Processing referral code: ${code} for customer: ${userId}`)
    
    // Connect to database
    const db = await connectToDatabase()
    
    // Find the referral link
    const referralLinkRecord = await db.collection("referralLinks").findOne({
      code: code,
      active: true
    })
    
    if (!referralLinkRecord) {
      return NextResponse.json(
        { error: "Invalid or expired referral link" },
        { status: 404 }
      )
    }
    
    console.log(`Found referral link: ${referralLinkRecord._id}`)
    
    // Increment the click count
    await db.collection("referralLinks").updateOne(
      { _id: referralLinkRecord._id },
      { $inc: { clicks: 1 } }
    )
    
    // Get campaign details
    const campaign = await db.collection("campaigns").findOne({
      _id: referralLinkRecord.campaignId
    })
    
    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }
    
    console.log(`Found campaign: ${campaign.name}`)
    
    // Get business details
    const business = await db.collection("users").findOne({
      _id: campaign.businessId,
      role: "business"
    })
    
    // Check if this user already has a conversion for this referral
    const existingConversion = await db.collection("conversions").findOne({
      referralLinkId: referralLinkRecord._id,
      customerId: new ObjectId(userId)
    })
    
    // If no existing conversion, create a pending one
    if (!existingConversion) {
      console.log(`Creating new conversion for customer ${userId}`)
      await db.collection("conversions").insertOne({
        referralLinkId: referralLinkRecord._id,
        referrerId: referralLinkRecord.referrerId,
        campaignId: referralLinkRecord.campaignId,
        customerId: new ObjectId(userId),
        status: "pending", // pending, completed, rejected
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } else {
      console.log(`Customer ${userId} already has a conversion for this referral`)
    }
    
    // Return the campaign data
    return NextResponse.json({
      _id: campaign._id.toString(),
      name: campaign.name,
      description: campaign.description,
      businessName: business?.businessName || business?.name || "Unknown Business",
      companyName: campaign.companyName,
      rewardType: campaign.rewardType,
      rewardAmount: campaign.rewardAmount,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      isActive: campaign.isActive,
      referralCode: code
    })
    
  } catch (error) {
    console.error("Error processing referral link:", error)
    return NextResponse.json(
      { error: "Failed to process referral link" },
      { status: 500 }
    )
  }
} 