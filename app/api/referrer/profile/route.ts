import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user || session.user.role !== "referrer") {
      return NextResponse.json(
        { error: "Unauthorized. You must be signed in as a referrer." },
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
    
    // Connect to database
    const db = await connectToDatabase()
    
    // Find the referrer profile
    const referrer = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      role: "referrer"
    })
    
    if (!referrer) {
      return NextResponse.json(
        { error: "Referrer profile not found" },
        { status: 404 }
      )
    }
    
    // Get business details
    let business = null
    if (referrer.businessId) {
      business = await db.collection("users").findOne(
        { _id: new ObjectId(referrer.businessId) },
        { projection: { _id: 1, name: 1, businessName: 1 } }
      )
    }
    
    // Get referrer statistics
    const referrals = await db.collection("referrals").find({
      referrerId: new ObjectId(userId)
    }).toArray()
    
    const successfulReferrals = referrals.filter(r => r.status === "converted").length
    
    // Available and redeemed rewards
    const availableRewards = await db.collection("rewards").countDocuments({
      userId: new ObjectId(userId),
      status: "available"
    })
    
    const redeemedRewards = await db.collection("rewards").countDocuments({
      userId: new ObjectId(userId),
      status: "redeemed"
    })
    
    // Calculate total earnings
    const rewards = await db.collection("rewards").find({
      userId: new ObjectId(userId)
    }).toArray()
    
    const totalEarnings = rewards.reduce((total, reward) => {
      return total + (reward.amount || 0)
    }, 0)
    
    // Get selected campaigns
    const selectedCampaigns = await db.collection("campaigns")
      .find({ 
        _id: { $in: (referrer.selectedCampaigns || []).map(id => new ObjectId(id)) } 
      })
      .toArray()
    
    // Format the profile data
    const profile = {
      _id: referrer._id.toString(),
      name: referrer.name,
      email: referrer.email,
      role: referrer.role,
      company: referrer.company || null,
      businessId: referrer.businessId ? referrer.businessId.toString() : null,
      businessName: business ? (business.businessName || business.name) : null,
      image: referrer.image || null,
      referralCode: referrer.referralCode || null,
      earnings: totalEarnings,
      metrics: {
        totalReferrals: referrals.length,
        successfulReferrals,
        conversionRate: referrals.length > 0 
          ? Math.round((successfulReferrals / referrals.length) * 100) 
          : 0,
        totalEarnings: totalEarnings
      },
      customerSince: referrer.customerSince || referrer.createdAt || null,
      paymentInfo: referrer.paymentInfo || {
        paypalEmail: referrer.email
      },
      statistics: {
        availableRewards,
        redeemedRewards,
        activeCampaigns: selectedCampaigns.length
      }
    }
    
    return NextResponse.json({ profile })
    
  } catch (error) {
    console.error("Error fetching referrer profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch referrer profile" },
      { status: 500 }
    )
  }
} 