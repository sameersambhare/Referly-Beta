import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from "mongodb";

// GET - Retrieve analytics for the authenticated business
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== "business") {
      return NextResponse.json(
        { error: "Unauthorized. Only business accounts can access analytics." },
        { status: 401 }
      );
    }
    
    const businessId = session.user.id;
    
    // Connect to the database
    const db = await connectToDatabase();
    
    // Get count of total referrals made for this business
    const totalReferrals = await db.collection("referrals").countDocuments({
      businessId: new ObjectId(businessId)
    });
    
    // Get total referral link clicks
    const referralLinks = await db.collection("referralLinks").find({
      businessId: new ObjectId(businessId)
    }).toArray();
    
    const totalClicks = referralLinks.reduce((sum, link) => sum + (link.clicks || 0), 0);
    
    // Get total conversions
    const totalConversions = await db.collection("referrals").countDocuments({
      businessId: new ObjectId(businessId),
      status: "converted"
    });
    
    // Calculate conversion rate
    const overallConversionRate = totalReferrals > 0 
      ? Math.round((totalConversions / totalReferrals) * 100) 
      : 0;
    
    // Get active referrals (pending)
    const activeReferralsCount = await db.collection("referrals").countDocuments({
      businessId: new ObjectId(businessId),
      status: "pending"
    });
    
    // Get active campaigns
    const activeCampaignsCount = await db.collection("campaigns").countDocuments({
      businessId: new ObjectId(businessId),
      status: "active"
    });
    
    // Get referred customers count
    const customersCount = await db.collection("users").countDocuments({
      businessId: new ObjectId(businessId),
      role: "customer"
    });
    
    // Get recent activity
    const recentActivity = await db.collection("referrals")
      .find({
        businessId: new ObjectId(businessId)
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    // Get campaign performance
    const campaigns = await db.collection("campaigns")
      .find({
        businessId: new ObjectId(businessId)
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    const campaignIds = campaigns.map(campaign => campaign._id);
    
    // Get referrals for each campaign
    const campaignReferrals = await db.collection("referrals")
      .aggregate([
        {
          $match: {
            campaignId: { $in: campaignIds }
          }
        },
        {
          $group: {
            _id: "$campaignId",
            total: { $sum: 1 },
            converted: {
              $sum: {
                $cond: [{ $eq: ["$status", "converted"] }, 1, 0]
              }
            }
          }
        }
      ])
      .toArray();
    
    // Create campaign performance data
    const campaignPerformance = campaigns.map(campaign => {
      const stats = campaignReferrals.find(
        stats => stats._id.toString() === campaign._id.toString()
      ) || { total: 0, converted: 0 };
      
      return {
        id: campaign._id.toString(),
        name: campaign.name,
        status: campaign.status || "inactive",
        startDate: campaign.startDate || null,
        endDate: campaign.endDate || null,
        total: stats.total,
        converted: stats.converted,
        conversionRate: stats.total > 0 
          ? Math.round((stats.converted / stats.total) * 100) 
          : 0
      };
    });
    
    // Get top referrers
    const topReferrers = await db.collection("referrals")
      .aggregate([
        {
          $match: {
            businessId: new ObjectId(businessId)
          }
        },
        {
          $group: {
            _id: "$referrerId",
            totalReferrals: { $sum: 1 },
            successfulReferrals: {
              $sum: {
                $cond: [{ $eq: ["$status", "converted"] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: { successfulReferrals: -1 }
        },
        {
          $limit: 5
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "referrer"
          }
        },
        {
          $unwind: "$referrer"
        },
        {
          $project: {
            referrerId: "$_id",
            name: "$referrer.name",
            email: "$referrer.email",
            totalReferrals: 1,
            successfulReferrals: 1,
            conversionRate: {
              $cond: [
                { $gt: ["$totalReferrals", 0] },
                { $multiply: [{ $divide: ["$successfulReferrals", "$totalReferrals"] }, 100] },
                0
              ]
            }
          }
        }
      ])
      .toArray();
    
    return NextResponse.json({
      summary: {
        totalReferrals,
        totalClicks,
        totalConversions,
        overallConversionRate,
        activeReferralsCount,
        activeCampaignsCount,
        customersCount
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity._id.toString(),
        referrerId: activity.referrerId.toString(),
        customerId: activity.customerId?.toString(),
        status: activity.status,
        createdAt: activity.createdAt,
        campaignId: activity.campaignId.toString(),
        campaignName: activity.campaignName || "Unknown Campaign"
      })),
      campaignPerformance,
      topReferrers: topReferrers.map(referrer => ({
        id: referrer.referrerId.toString(),
        name: referrer.name,
        email: referrer.email,
        totalReferrals: referrer.totalReferrals,
        successfulReferrals: referrer.successfulReferrals,
        conversionRate: Math.round(referrer.conversionRate)
      })),
      // Additional metrics for future use
      timeBasedMetrics: {
        daily: {
          referrals: Math.floor(Math.random() * 10),
          conversions: Math.floor(Math.random() * 5)
        },
        weekly: {
          referrals: Math.floor(Math.random() * 50),
          conversions: Math.floor(Math.random() * 25)
        },
        monthly: {
          referrals: Math.floor(Math.random() * 150),
          conversions: Math.floor(Math.random() * 75)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
} 