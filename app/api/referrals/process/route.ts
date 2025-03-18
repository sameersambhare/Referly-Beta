import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request) {
  try {
    // Get the referral code from the request
    const body = await request.json()
    const { code } = body
    
    if (!code) {
      return NextResponse.json(
        { error: "Referral code is required" },
        { status: 400 }
      )
    }
    
    // Connect to database
    const db = await connectToDatabase()
    
    // Find the referral link
    const referralLink = await db.collection("referralLinks").findOne({
      code: code,
      active: true
    })
    
    if (!referralLink) {
      return NextResponse.json(
        { error: "Invalid or expired referral link" },
        { status: 404 }
      )
    }
    
    // Increment the click count
    await db.collection("referralLinks").updateOne(
      { _id: referralLink._id },
      { $inc: { clicks: 1 } }
    )
    
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
    
    // Get referrer details
    const referrer = await db.collection("referrers").findOne({
      _id: referralLink.referrerId
    })
    
    // Get business details
    const business = await db.collection("businesses").findOne({
      _id: campaign.businessId
    })
    
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    
    // If user is authenticated, store the referral in their session
    if (userId) {
      // Check if this user already has a conversion for this referral
      const existingConversion = await db.collection("conversions").findOne({
        referralLinkId: referralLink._id,
        customerId: new ObjectId(userId)
      })
      
      // If no existing conversion, create a pending one
      if (!existingConversion) {
        await db.collection("conversions").insertOne({
          referralLinkId: referralLink._id,
          referrerId: referralLink.referrerId,
          campaignId: referralLink.campaignId,
          customerId: new ObjectId(userId),
          status: "pending", // pending, completed, rejected
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    }
    
    // Return the referral data
    return NextResponse.json({
      campaignId: campaign._id.toString(),
      campaignName: campaign.name,
      campaignDescription: campaign.description,
      companyName: business?.name || "Unknown Business",
      referrerName: referrer?.name || "Anonymous",
      customMessage: referralLink.customMessage,
      code: referralLink.code
    })
    
  } catch (error) {
    console.error("Error processing referral:", error)
    return NextResponse.json(
      { error: "Failed to process referral" },
      { status: 500 }
    )
  }
} 