import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { Analytics, Referral, Campaign, Customer } from '@/models';
import { connectToDatabase } from '@/lib/mongodb';
import { AnalyticsQuery, AnalyticsData } from '@/types/api';

// GET - Retrieve analytics for the authenticated business
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Connect to the database
    const db = await connectToDatabase();
    
    // Get user ID from session
    const userId = session.user.id;
    
    // Get analytics data
    // For now, we'll return mock data since we may not have real data yet
    const mockAnalyticsData = {
      summary: {
        totalReferrals: 45,
        totalClicks: 230,
        totalConversions: 18,
        overallConversionRate: 7.8,
        activeReferralsCount: 12,
        activeCampaignsCount: 2,
        customersCount: 28
      },
      recentActivity: [
        {
          type: "referral",
          date: new Date().toISOString(),
          description: "New referral from John Doe"
        },
        {
          type: "conversion",
          date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          description: "Sarah Smith completed signup"
        }
      ],
      campaigns: [
        {
          id: "campaign123",
          title: "Summer Referral Program",
          status: "active",
          startDate: "2023-06-01",
          endDate: "2023-08-31",
          completedTasks: 12,
          totalTasks: 25,
          referrals: 8
        },
        {
          id: "campaign456",
          title: "New Customer Onboarding",
          status: "active",
          startDate: "2023-07-15",
          endDate: "2023-09-15",
          completedTasks: 5,
          totalTasks: 15,
          referrals: 3
        },
        {
          id: "campaign789",
          title: "Spring Promotion",
          status: "completed",
          startDate: "2023-03-01",
          endDate: "2023-05-31",
          completedTasks: 30,
          totalTasks: 30,
          referrals: 22
        }
      ]
    };
    
    // In a real implementation, you would query the database for actual data
    // const referrals = await Referral.find({ businessId: userId }).count();
    // const campaigns = await Campaign.find({ businessId: userId, status: 'active' }).count();
    // const customers = await Customer.find({ businessId: userId }).count();
    
    return NextResponse.json(mockAnalyticsData);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
} 