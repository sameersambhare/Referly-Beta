"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { AIAssistant } from "@/app/components/dashboard/AIAssistant"
import { AlertCircle, RefreshCw, ArrowRight, Users, Calendar, BarChart3, CheckCircle } from "lucide-react"

interface DashboardStats {
  totalReferrals: number
  totalClicks: number
  totalConversions: number
  conversionRate: number
  activeReferrals: number
  activeCampaigns: number
  totalCustomers: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalReferrals: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: 0,
    activeReferrals: 0,
    activeCampaigns: 0,
    totalCustomers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [topReferrers, setTopReferrers] = useState<any[]>([])
  const [campaignPerformance, setCampaignPerformance] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  
  const fetchDashboardData = async () => {
    if (status === "authenticated") {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch("/api/analytics")
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch dashboard data")
        }
        
        const data = await response.json()
        
        setStats({
          totalReferrals: data.summary.totalReferrals,
          totalClicks: data.summary.totalClicks,
          totalConversions: data.summary.totalConversions,
          conversionRate: data.summary.overallConversionRate,
          activeReferrals: data.summary.activeReferralsCount,
          activeCampaigns: data.summary.activeCampaignsCount,
          totalCustomers: data.summary.customersCount,
        })

        // Set additional analytics data
        setTopReferrers(data.topReferrers || [])
        setCampaignPerformance(data.campaignPerformance || [])
        setRecentActivity(data.recentActivity || [])
      } catch (error) {
        console.error("Dashboard data error:", error)
        setError(error instanceof Error ? error.message : "Error loading dashboard data")
      } finally {
        setIsLoading(false)
      }
    }
  }
  
  useEffect(() => {
    fetchDashboardData()
  }, [status])
  
  if (status === "loading" || isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="bg-destructive/15 p-6 rounded-md text-destructive mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/campaigns/new">
            <Button>Create Campaign</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Referrals</CardDescription>
            <CardTitle className="text-3xl">{stats.totalReferrals}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.activeReferrals} active referrals
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Clicks</CardDescription>
            <CardTitle className="text-3xl">{stats.totalClicks}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              From all your referral links
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversion Rate</CardDescription>
            <CardTitle className="text-3xl">{stats.conversionRate.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {stats.totalConversions} total conversions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Campaigns</CardDescription>
            <CardTitle className="text-3xl">{stats.activeCampaigns}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground mb-1">
                Total referrals: <span className="font-medium">{stats.totalReferrals}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                <Link href="/campaigns" className="text-primary hover:underline">
                  View all campaigns
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="md:col-span-2 lg:col-span-2 h-[650px]">
          <AIAssistant userName={session?.user?.name || "there"} />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/customers/new">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </Link>
            <Link href="/follow-ups/new">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Follow-up
              </Button>
            </Link>
            <Link href="/customers/import">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Import Customers
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="outline" className="w-full justify-start">
                <ArrowRight className="mr-2 h-4 w-4" />
                Manage Campaigns
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
            <CardDescription>
              Your most successful referrers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topReferrers.length > 0 ? (
              <div className="space-y-4">
                {topReferrers.map((referrer) => (
                  <div key={referrer.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{referrer.name}</p>
                        <p className="text-xs text-muted-foreground">{referrer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{referrer.successfulReferrals} / {referrer.totalReferrals}</p>
                      <p className="text-xs text-muted-foreground">{referrer.conversionRate}% Rate</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No referrer data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>
              Your recent campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {campaignPerformance.length > 0 ? (
              <div className="space-y-4">
                {campaignPerformance.map((campaign) => (
                  <div key={campaign.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">{campaign.name}</p>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          campaign.status === "active" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {campaign.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Performance</span>
                        <span className="font-medium">{campaign.converted} / {campaign.total} conversions ({campaign.conversionRate}%)</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full" 
                          style={{ width: `${campaign.conversionRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Referrals</p>
                        <p className="font-medium">{campaign.total}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversions</p>
                        <p className="font-medium">{campaign.converted}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rate</p>
                        <p className="font-medium">{campaign.conversionRate}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No campaign data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            The latest actions from your referral program
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activity.status === "converted" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {activity.status === "converted" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Users className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      {activity.status === "converted" ? (
                        <span className="font-medium">Successful conversion</span>
                      ) : (
                        <span className="font-medium">New referral</span>
                      )}
                      {" "}for campaign <span className="font-medium">{activity.campaignName}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.createdAt 
                        ? `${new Date(activity.createdAt).toLocaleDateString()} at ${new Date(activity.createdAt).toLocaleTimeString()}`
                        : "Date not available"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
          <CardDescription>
            Currently running campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {campaignPerformance.length > 0 ? (
            <div className="space-y-8">
              {(() => {
                const activeCampaigns = campaignPerformance.filter(campaign => campaign.status === "active");
                
                if (activeCampaigns.length === 0) {
                  return (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground">No active campaigns at the moment</p>
                      <Link href="/campaigns/new">
                        <Button className="mt-4">Create New Campaign</Button>
                      </Link>
                    </div>
                  );
                }
                
                return activeCampaigns.map((campaign) => (
                  <div key={campaign.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-base font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.startDate 
                            ? `Started on ${new Date(campaign.startDate).toLocaleDateString()}` 
                            : ''}
                          {campaign.startDate && campaign.endDate ? ' • ' : ''}
                          {campaign.endDate 
                            ? `Ends on ${new Date(campaign.endDate).toLocaleDateString()}` 
                            : ''}
                        </p>
                      </div>
                      <Link href={`/campaigns/${campaign.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Performance</span>
                        <span className="font-medium">{campaign.converted} / {campaign.total} conversions ({campaign.conversionRate}%)</span>
                      </div>
                      <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-primary h-full" 
                          style={{ width: `${campaign.conversionRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Referrals</p>
                        <p className="font-medium">{campaign.total}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversions</p>
                        <p className="font-medium">{campaign.converted}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Rate</p>
                        <p className="font-medium">{campaign.conversionRate}%</p>
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No campaigns found</p>
              <Link href="/campaigns/new">
                <Button className="mt-4">Create Your First Campaign</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 