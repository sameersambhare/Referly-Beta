import { NextResponse } from 'next/server';
import { connectToMongoose } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('Testing Mongoose connection...');
    await connectToMongoose();
    
    // Check if we're connected
    const readyState = mongoose.connection.readyState;
    const readyStateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized'
    };
    
    if (readyState !== 1) {
      throw new Error(`Mongoose connection not ready. Current state: ${readyStateMap[readyState]}`);
    }

    const dbName = mongoose.connection.db?.databaseName || 'unknown';

    return NextResponse.json({
      status: 'success',
      message: 'Mongoose connection successful',
      database: dbName,
      readyState: readyStateMap[readyState]
    });
  } catch (error) {
    console.error('Mongoose connection test failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Mongoose connection failed',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 