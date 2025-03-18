import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
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
    
    console.log(`Fetching campaigns for customer: ${userId}`)
    
    // Connect to database
    const db = await connectToDatabase()
    
    // Find conversions for this customer
    const conversions = await db.collection("conversions").find({
      customerId: new ObjectId(userId)
    }).toArray()
    
    console.log(`Found ${conversions.length} conversions for customer ${userId}`)
    
    // Extract campaign IDs from conversions
    const campaignIdsFromConversions = conversions.map(conversion => 
      conversion.campaignId instanceof ObjectId 
        ? conversion.campaignId 
        : new ObjectId(conversion.campaignId)
    )
    
    // Find shared campaigns by this customer
    const sharedCampaigns = await db.collection("customerShares").find({
      customerId: new ObjectId(userId)
    }).toArray()
    
    console.log(`Found ${sharedCampaigns.length} shared campaigns for customer ${userId}`)
    
    // Extract campaign IDs from shared campaigns
    const campaignIdsFromShares = sharedCampaigns.map(share => 
      share.campaignId instanceof ObjectId 
        ? share.campaignId 
        : new ObjectId(share.campaignId)
    )
    
    // Combine all campaign IDs (referred and shared)
    const allCampaignIds = [...new Set([...campaignIdsFromConversions, ...campaignIdsFromShares])]
    
    if (allCampaignIds.length === 0) {
      // If no campaign IDs found, fetch some active campaigns for discovery
      const activeCampaigns = await db.collection("campaigns")
        .find({ isActive: true })
        .limit(6)
        .toArray()
      
      // Get business details for active campaigns
      const businessIds = [...new Set(activeCampaigns.map(campaign => 
        campaign.businessId instanceof ObjectId 
          ? campaign.businessId 
          : new ObjectId(campaign.businessId)
      ))]
      
      const businesses = await db.collection("users").find({
        _id: { $in: businessIds },
        role: "business"
      }).toArray()
      
      // Map business names to campaigns
      const activeCampaignsWithBusinessNames = activeCampaigns.map(campaign => {
        const business = businesses.find(b => 
          b._id.toString() === campaign.businessId.toString()
        )
        
        return {
          ...campaign,
          businessName: business?.businessName || business?.name || "Unknown Business",
          _id: campaign._id.toString(),
          isActive: true,
          isShared: false
        }
      })
      
      return NextResponse.json({ campaigns: activeCampaignsWithBusinessNames })
    }
    
    // Fetch campaign details for all campaign IDs
    const campaigns = await db.collection("campaigns").find({
      _id: { $in: allCampaignIds }
    }).toArray()
    
    console.log(`Found ${campaigns.length} campaigns total`)
    
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
    
    // Map business names and share status to campaigns
    const campaignsWithDetails = campaigns.map(campaign => {
      const business = businesses.find(b => 
        b._id.toString() === campaign.businessId.toString()
      )
      
      const isShared = sharedCampaigns.some(share => 
        share.campaignId.toString() === campaign._id.toString()
      )
      
      const shareInfo = isShared ? sharedCampaigns.find(share => 
        share.campaignId.toString() === campaign._id.toString()
      ) : null
      
      return {
        ...campaign,
        businessName: business?.businessName || business?.name || "Unknown Business",
        _id: campaign._id.toString(),
        isShared: isShared,
        shareMethod: shareInfo?.shareMethod || null,
        shareDate: shareInfo?.createdAt || null
      }
    })
    
    return NextResponse.json({ campaigns: campaignsWithDetails })
    
  } catch (error) {
    console.error("Error fetching customer campaigns:", error)
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    )
  }
} 