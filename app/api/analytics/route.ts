import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import connectToDatabase from '@/lib/mongodb';
import Analytics from '@/models/Analytics';
import Referral from '@/models/Referral';
import Campaign from '@/models/Campaign';
import Customer from '@/models/Customer';

// GET - Retrieve analytics for the authenticated business
export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'business') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    
    // Get query parameters
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const campaignId = searchParams.get('campaignId');
    
    // Parse dates
    let startDateObj = startDate ? new Date(startDate) : new Date();
    startDateObj.setDate(startDateObj.getDate() - 30); // Default to last 30 days
    startDateObj.setHours(0, 0, 0, 0);
    
    let endDateObj = endDate ? new Date(endDate) : new Date();
    endDateObj.setHours(23, 59, 59, 999);
    
    // Build query
    const query: any = { 
      businessId: session.user.id,
      date: { 
        $gte: startDateObj,
        $lte: endDateObj
      }
    };
    
    if (campaignId) {
      query.campaignId = campaignId;
    }
    
    // Fetch analytics
    const analyticsData = await Analytics.find(query).sort({ date: 1 });
    
    // Calculate summary metrics
    const totalReferrals = analyticsData.reduce((sum, item) => sum + item.referralCount, 0);
    const totalClicks = analyticsData.reduce((sum, item) => sum + item.clickCount, 0);
    const totalConversions = analyticsData.reduce((sum, item) => sum + item.conversionCount, 0);
    const totalRewardsPaid = analyticsData.reduce((sum, item) => sum + item.rewardsPaid, 0);
    
    // Calculate overall conversion rate
    const overallConversionRate = totalClicks > 0 ? (totalReferrals / totalClicks) * 100 : 0;
    
    // Get additional metrics
    const activeReferralsCount = await Referral.countDocuments({
      businessId: session.user.id,
      status: { $in: ['pending', 'contacted'] }
    });
    
    const activeCampaignsCount = await Campaign.countDocuments({
      businessId: session.user.id,
      isActive: true
    });
    
    const customersCount = await Customer.countDocuments({
      businessId: session.user.id
    });
    
    // Format response
    const response = {
      timeSeriesData: analyticsData,
      summary: {
        totalReferrals,
        totalClicks,
        totalConversions,
        totalRewardsPaid,
        overallConversionRate,
        activeReferralsCount,
        activeCampaignsCount,
        customersCount,
        dateRange: {
          startDate: startDateObj,
          endDate: endDateObj
        }
      }
    };
    
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 