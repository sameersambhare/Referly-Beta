import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection("users");
    
    // Check if test user already exists
    const existingUser = await usersCollection.findOne({ email: 'business@example.com' });
    
    if (existingUser) {
      return NextResponse.json({
        message: 'Test business user already exists',
        email: 'business@example.com',
        password: 'password123'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create user object
    const userData = {
      email: 'business@example.com',
      password: hashedPassword,
      name: 'Test Business',
      role: 'business',
      businessName: 'Test Company',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Insert user directly into the collection
    const result = await usersCollection.insertOne(userData);
    
    return NextResponse.json({
      message: 'Test business user created successfully',
      email: 'business@example.com',
      password: 'password123',
      userId: result.insertedId.toString()
    });
  } catch (error) {
    console.error('Error creating test business user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 