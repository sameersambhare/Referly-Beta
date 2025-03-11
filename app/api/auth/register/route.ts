import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import bcrypt from "bcryptjs";

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  businessName: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export async function POST(request: Request): Promise<NextResponse<RegisterResponse>> {
  try {
    const { email, password, name, businessName } = (await request.json()) as RegisterRequest;

    if (!email || !password || !name || !businessName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      businessName,
      role: "business",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

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