import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only allow admin users to access this endpoint
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.log('Starting update-all process...');
    
    // Step 1: Update businesses with company information
    console.log('Step 1: Updating businesses...');
    const businessResponse = await fetch(new URL('/api/admin/update-businesses', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      }
    });
    
    if (!businessResponse.ok) {
      throw new Error(`Failed to update businesses: ${businessResponse.statusText}`);
    }
    
    const businessResult = await businessResponse.json();
    console.log(`Updated ${businessResult.updates?.length || 0} businesses`);
    
    // Step 2: Update referrers with company information
    console.log('Step 2: Updating referrers...');
    const referrerResponse = await fetch(new URL('/api/admin/update-referrers', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      }
    });
    
    if (!referrerResponse.ok) {
      throw new Error(`Failed to update referrers: ${referrerResponse.statusText}`);
    }
    
    const referrerResult = await referrerResponse.json();
    console.log(`Updated ${referrerResult.updates?.length || 0} referrers`);
    
    // Step 3: Update campaigns with company information
    console.log('Step 3: Updating campaigns...');
    const campaignResponse = await fetch(new URL('/api/admin/update-campaigns', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      }
    });
    
    if (!campaignResponse.ok) {
      throw new Error(`Failed to update campaigns: ${campaignResponse.statusText}`);
    }
    
    const campaignResult = await campaignResponse.json();
    console.log(`Updated ${campaignResult.updates?.length || 0} campaigns`);
    
    // Step 4: Link referrers to businesses
    console.log('Step 4: Linking referrers to businesses...');
    const linkResponse = await fetch(new URL('/api/admin/link-referrers', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      }
    });
    
    if (!linkResponse.ok) {
      throw new Error(`Failed to link referrers: ${linkResponse.statusText}`);
    }
    
    const linkResult = await linkResponse.json();
    console.log(`Linked ${linkResult.updates?.length || 0} referrers to businesses`);
    
    // Return combined results
    return NextResponse.json({
      message: 'All update operations completed successfully',
      results: {
        businesses: businessResult,
        referrers: referrerResult,
        campaigns: campaignResult,
        links: linkResult
      }
    });
  } catch (error) {
    console.error('Error in update-all process:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 