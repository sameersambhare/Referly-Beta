import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import bcrypt from "bcryptjs";
import { ObjectId } from 'mongodb';

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  businessName?: string;
  company?: string;
  role: 'business' | 'referrer' | 'admin';
}

interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export async function POST(request: Request): Promise<NextResponse<RegisterResponse>> {
  try {
    const { email, password, name, businessName, company, role } = (await request.json()) as RegisterRequest;

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Business role requires businessName
    if (role === 'business' && !businessName) {
      return NextResponse.json(
        { success: false, message: "Business name is required for business accounts" },
        { status: 400 }
      );
    }

    // Referrer role requires company
    if (role === 'referrer' && !company) {
      return NextResponse.json(
        { success: false, message: "Company name is required for referrer accounts" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection("users");

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    // If referrer is registering, find the business ID for their company
    let businessId = null;
    if (role === 'referrer' && company) {
      const businessUser = await usersCollection.findOne({ 
        businessName: company,
        role: 'business'
      });

      if (businessUser) {
        businessId = businessUser._id;
      } else {
        // If no exact match, try to find a business with a similar name
        const businesses = await usersCollection.find({ 
          role: 'business',
          businessName: { $regex: new RegExp(company, 'i') }
        }).toArray();

        if (businesses.length > 0) {
          // Use the first matching business
          businessId = businesses[0]._id;
        }
      }

      // If still no business found, create a placeholder business ID
      if (!businessId) {
        businessId = new ObjectId();
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object based on role
    const userData: any = {
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add role-specific fields
    if (role === 'business') {
      userData.businessName = businessName;
    } else if (role === 'referrer') {
      userData.referralCode = generateReferralCode(name);
      userData.referrals = [];
      userData.earnings = 0;
      userData.company = company;
      userData.businessId = businessId;
    }

    // Create user
    const result = await usersCollection.insertOne(userData);

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        userId: result.insertedId.toString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate a referral code
function generateReferralCode(name: string): string {
  const namePrefix = name.substring(0, 3).toUpperCase();
  const randomString = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${namePrefix}-${randomString}`;
} 