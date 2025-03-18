import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models';
import bcrypt from 'bcryptjs';

export async function GET() {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  try {
    await connectToDatabase();
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'business@test.com' });
    
    if (existingUser) {
      return NextResponse.json({
        message: 'Test user already exists',
        user: {
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
          businessName: existingUser.businessName,
        },
        password: 'password123'
      });
    }
    
    // Create a test business user
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const testUser = new User({
      email: 'business@test.com',
      password: hashedPassword,
      name: 'Test Business',
      role: 'business',
      businessName: 'Test Company',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    await testUser.save();
    
    return NextResponse.json({
      message: 'Test user created successfully',
      user: {
        email: testUser.email,
        name: testUser.name,
        role: testUser.role,
        businessName: testUser.businessName,
      },
      password: 'password123'
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 