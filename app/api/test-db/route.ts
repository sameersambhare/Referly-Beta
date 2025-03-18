import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    const db = await connectToDatabase();
    
    // Try to ping the database
    await db.command({ ping: 1 });
    
    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connection successful',
      database: db.databaseName
    });
  } catch (error) {
    console.error('MongoDB connection test failed:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'MongoDB connection failed',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 