import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/options"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== "referrer") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Get the referrer's ID from the session
    const referrerId = session.user.id
    
    // Connect to the database
    console.log("Connecting to database for referrer campaigns...")
    const db = await connectToDatabase()
    console.log("Connected to database")
    
    // First, get the referrer's details to find their company
    const referrersCollection = db.collection("users")
    const referrer = await referrersCollection.findOne({ 
      _id: new ObjectId(referrerId),
      role: "referrer"
    })
    
    if (!referrer) {
      return NextResponse.json(
        { error: "Referrer not found" },
        { status: 404 }
      )
    }
    
    // Get the referrer's company
    const referrerCompany = referrer.company
    console.log(`Referrer ${referrerId} has company: ${referrerCompany || 'None'}`)
    
    if (!referrerCompany) {
      console.log("No company found for referrer")
      return NextResponse.json([])
    }
    
    // Find campaigns directly by company name
    const campaignsCollection = db.collection("campaigns")
    let campaigns = await campaignsCollection.find({
      $or: [
        { companyName: referrerCompany },
        { businessName: referrerCompany }
      ],
      isActive: true
    }).toArray()
    
    console.log(`Found ${campaigns.length} campaigns directly matching company name: ${referrerCompany}`)
    
    // If no campaigns found directly, try to find business users with matching businessName
    if (campaigns.length === 0) {
      console.log("No direct matches, looking for businesses with matching name")
      const businessesCollection = db.collection("users")
      const businesses = await businessesCollection.find({
        role: "business",
        $or: [
          { businessName: referrerCompany },
          { name: referrerCompany },
          { company: referrerCompany }
        ]
      }).toArray()
      
      console.log(`Found ${businesses.length} businesses matching company name: ${referrerCompany}`)
      
      if (businesses.length > 0) {
        // Get business IDs
        const businessIds = businesses.map(business => business._id.toString())
        console.log(`Business IDs: ${businessIds.join(', ')}`)
        
        // Get all campaigns from the matching businesses
        campaigns = await campaignsCollection.find({
          businessId: { $in: businessIds },
          isActive: true
        }).toArray()
        
        console.log(`Found ${campaigns.length} campaigns for businesses matching company name`)
      }
    }
    
    // Check if the referrer has already selected any campaigns
    const referrerCampaignsCollection = db.collection("referrerCampaigns")
    const selectedCampaigns = await referrerCampaignsCollection.find({
      referrerId: referrerId
    }).toArray()
    
    const selectedCampaignIds = selectedCampaigns.map(sc => sc.campaignId.toString())
    
    // Add business name to each campaign and mark as selected if applicable
    const businessesCollection = db.collection("users")
    const campaignsWithBusinessInfo = await Promise.all(campaigns.map(async campaign => {
      let businessName = campaign.companyName || "Unknown Business"
      
      // If no companyName, try to get it from the business
      if (!businessName || businessName === "Unknown Business") {
        const business = await businessesCollection.findOne({
          _id: new ObjectId(campaign.businessId)
        })
        
        businessName = business?.businessName || business?.name || "Unknown Business"
      }
      
      return {
        ...campaign,
        businessName: businessName,
        companyName: businessName, // Ensure both fields are populated
        isSelected: selectedCampaignIds.includes(campaign._id.toString())
      }
    }))
    
    return NextResponse.json(campaignsWithBusinessInfo)
  } catch (error) {
    console.error("Error fetching referrer campaigns:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 