import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    console.log("Starting referral link generation process")
    
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      console.log("User not authenticated")
      return NextResponse.json(
        { error: "You must be signed in to generate a referral link" },
        { status: 401 }
      )
    }
    
    // Get user ID from session
    const userId = session.user.id
    console.log(`User ID from session: ${userId}`)
    
    if (!userId) {
      console.log("User ID not found in session")
      return NextResponse.json(
        { error: "User ID not found in session" },
        { status: 400 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    const { campaignId, customMessage } = body
    console.log(`Request for campaign ID: ${campaignId}`)
    
    if (!campaignId) {
      console.log("Campaign ID is required")
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      )
    }
    
    // Connect to database
    console.log("Connecting to database")
    const db = await connectToDatabase()
    console.log("Connected to database")
    
    // Verify campaign exists
    console.log(`Looking for campaign with ID: ${campaignId}`)
    const campaign = await db.collection("campaigns").findOne({
      _id: new ObjectId(campaignId)
    })
    
    if (!campaign) {
      console.log(`Campaign with ID ${campaignId} not found`)
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      )
    }
    
    console.log(`Found campaign: ${campaign.name}`)
    
    // Verify user has access to this campaign by checking referrerCampaigns collection
    console.log(`Checking if user ${userId} has access to campaign ${campaignId}`)
    const referrerCampaign = await db.collection("referrerCampaigns").findOne({
      referrerId: userId,
      campaignId: new ObjectId(campaignId)
    })
    
    if (!referrerCampaign) {
      console.log(`User ${userId} not found in referrerCampaigns collection for campaign ${campaignId}`)
      
      // If not found in referrerCampaigns, check if the user is a referrer and has the same company as the campaign
      console.log(`Checking if user ${userId} is a referrer`)
      const referrer = await db.collection("users").findOne({
        _id: new ObjectId(userId),
        role: "referrer"
      })
      
      if (!referrer) {
        console.log(`User ${userId} is not a referrer`)
        return NextResponse.json(
          { error: "You don't have access to this campaign" },
          { status: 403 }
        )
      }
      
      console.log(`User ${userId} is a referrer with company: ${referrer.company || 'None'}`)
      const referrerCompany = referrer.company
      
      // Check if campaign belongs to the same company
      console.log(`Checking if campaign belongs to company: ${referrerCompany}`)
      console.log(`Campaign company name: ${campaign.companyName || 'None'}`)
      console.log(`Campaign business name: ${campaign.businessName || 'None'}`)
      
      const campaignBelongsToCompany = 
        (campaign.companyName && campaign.companyName === referrerCompany) ||
        (campaign.businessName && campaign.businessName === referrerCompany)
      
      if (!campaignBelongsToCompany) {
        console.log(`Campaign does not directly belong to company ${referrerCompany}`)
        // Check if campaign's business belongs to the same company
        console.log(`Checking if campaign's business belongs to company ${referrerCompany}`)
        const business = await db.collection("users").findOne({
          _id: new ObjectId(campaign.businessId),
          $or: [
            { businessName: referrerCompany },
            { name: referrerCompany },
            { company: referrerCompany }
          ]
        })
        
        if (!business) {
          console.log(`No business found matching company ${referrerCompany}`)
          return NextResponse.json(
            { error: "You don't have access to this campaign" },
            { status: 403 }
          )
        }
        
        console.log(`Found matching business: ${business.name || business.businessName || 'Unknown'}`)
      } else {
        console.log(`Campaign directly belongs to company ${referrerCompany}`)
      }
      
      // If we get here, the referrer has access to the campaign but hasn't explicitly selected it
      // Let's add it to their selected campaigns
      console.log(`Adding campaign ${campaignId} to user ${userId}'s selected campaigns`)
      await db.collection("referrerCampaigns").insertOne({
        referrerId: userId,
        campaignId: new ObjectId(campaignId),
        businessId: campaign.businessId,
        selectedAt: new Date(),
        referrals: [],
        status: "active"
      })
      console.log(`Campaign ${campaignId} added to user ${userId}'s selected campaigns`)
    } else {
      console.log(`User ${userId} already has access to campaign ${campaignId}`)
    }
    
    // Generate a unique referral code
    console.log("Generating referral code")
    const referralCode = crypto.randomBytes(6).toString("hex")
    console.log(`Generated referral code: ${referralCode}`)
    
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
    console.log("Saving referral link to database")
    const result = await db.collection("referralLinks").insertOne(referralLink)
    
    if (!result.acknowledged) {
      console.log("Failed to create referral link")
      return NextResponse.json(
        { error: "Failed to create referral link" },
        { status: 500 }
      )
    }
    
    console.log(`Referral link created with ID: ${result.insertedId}`)
    
    // Construct the full referral link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const fullReferralLink = `${baseUrl}/r/${referralCode}`
    console.log(`Full referral link: ${fullReferralLink}`)
    
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

// Helper function to generate a referral code
function generateReferralCode(name: string): string {
  const namePrefix = name.substring(0, 3).toUpperCase();
  const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${namePrefix}-${randomString}`;
} 