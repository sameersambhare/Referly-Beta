import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/options"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
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
    
    // Connect to database
    const db = await connectToDatabase()
    
    // Find the customer profile
    const customer = await db.collection("users").findOne({
      _id: new ObjectId(userId),
      role: "customer"
    })
    
    if (!customer) {
      return NextResponse.json(
        { error: "Customer profile not found" },
        { status: 404 }
      )
    }
    
    // Get referrer details if applicable
    let referredBy = null
    if (customer.referredBy) {
      referredBy = await db.collection("users").findOne(
        { _id: new ObjectId(customer.referredBy) },
        { projection: { _id: 1, name: 1, email: 1, role: 1 } }
      )
    }
    
    // Get business details
    let business = null
    if (customer.businessId) {
      business = await db.collection("users").findOne(
        { _id: new ObjectId(customer.businessId) },
        { projection: { _id: 1, name: 1, businessName: 1 } }
      )
    }
    
    // Get customer statistics
    const availableRewards = await db.collection("rewards").countDocuments({
      userId: new ObjectId(userId),
      status: "available"
    })
    
    const redeemedRewards = await db.collection("rewards").countDocuments({
      userId: new ObjectId(userId),
      status: "redeemed"
    })
    
    // Get total value of customer's purchases (approximation)
    const customerShares = await db.collection("customerShares").find({
      customerId: new ObjectId(userId)
    }).toArray()
    
    // Calculate customer value (could be based on multiple factors)
    const customerValue = customerShares.length * 15 // Simple approximation
    
    // Format the profile data
    const profile = {
      _id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
      role: customer.role,
      image: customer.image || null,
      referredBy: referredBy ? {
        id: referredBy._id.toString(),
        name: referredBy.name,
        email: referredBy.email,
      } : null,
      businessId: customer.businessId ? customer.businessId.toString() : null,
      businessName: business ? (business.businessName || business.name) : null,
      conversionStatus: customer.conversionStatus || "pending",
      conversionDate: customer.conversionDate || null,
      referralCode: customer.referralCode || null,
      loyaltyPoints: customer.loyaltyPoints || 0,
      dateJoined: customer.createdAt || null,
      preferences: customer.preferences || {
        categories: [],
        communicationPreferences: {
          email: true,
          sms: false,
        }
      },
      customerValue: customerValue,
      statistics: {
        availableRewards,
        redeemedRewards,
        totalShares: customerShares.length
      }
    }
    
    return NextResponse.json({ profile })
    
  } catch (error) {
    console.error("Error fetching customer profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch customer profile" },
      { status: 500 }
    )
  }
} 