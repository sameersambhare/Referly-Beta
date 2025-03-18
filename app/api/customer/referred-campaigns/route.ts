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
    
    console.log(`Fetching referred campaigns for customer: ${userId}`)
    
    // Connect to database
    const db = await connectToDatabase()
    
    // Find conversions for this customer
    const conversions = await db.collection("conversions").find({
      customerId: new ObjectId(userId)
    }).toArray()
    
    console.log(`Found ${conversions.length} conversions for customer ${userId}`)
    
    if (conversions.length === 0) {
      return NextResponse.json([])
    }
    
    // Extract campaign IDs from conversions
    const campaignIds = [...new Set(conversions.map(conversion => 
      conversion.campaignId instanceof ObjectId 
        ? conversion.campaignId 
        : new ObjectId(conversion.campaignId)
    ))]
    
    console.log(`Found ${campaignIds.length} unique campaign IDs`)
    
    // Fetch campaign details
    const campaigns = await db.collection("campaigns").find({
      _id: { $in: campaignIds }
    }).toArray()
    
    console.log(`Found ${campaigns.length} campaigns`)
    
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
    
    // Map business names to campaigns
    const campaignsWithBusinessNames = campaigns.map(campaign => {
      const business = businesses.find(b => 
        b._id.toString() === campaign.businessId.toString()
      )
      
      return {
        ...campaign,
        businessName: business?.businessName || business?.name || "Unknown Business",
        _id: campaign._id.toString()
      }
    })
    
    return NextResponse.json(campaignsWithBusinessNames)
    
  } catch (error) {
    console.error("Error fetching referred campaigns:", error)
    return NextResponse.json(
      { error: "Failed to fetch referred campaigns" },
      { status: 500 }
    )
  }
} 