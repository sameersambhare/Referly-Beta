"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { AIAssistant } from "@/app/components/dashboard/AIAssistant"
import { CouponRewards } from "@/app/components/dashboard/CouponRewards"
import { Badge } from "@/app/components/ui/badge"
import { ArrowRight, Users, Calendar, Gift, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

interface DashboardStats {
  totalReferrals: number
  totalClicks: number
  totalConversions: number
  conversionRate: number
  activeReferrals: number
  activeCampaigns: number
  totalCustomers: number
}

interface Campaign {
  id: string
  title: string
  status: "active" | "completed" | "upcoming"
  startDate: string
  endDate: string
  completedTasks: number
  totalTasks: number
  referrals: number
}

interface RecentActivity {
  type: string
  date: string
  description: string
}

interface DashboardData {
  summary: {
    totalReferrals: number
    totalClicks: number
    totalConversions: number
    overallConversionRate: number
    activeReferralsCount: number
    activeCampaignsCount: number
    customersCount: number
  }
  recentActivity: RecentActivity[]
  campaigns: Campaign[]
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
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
        
        const data: DashboardData = await response.json()
        
        setStats({
          totalReferrals: data.summary.totalReferrals,
          totalClicks: data.summary.totalClicks,
          totalConversions: data.summary.totalConversions,
          conversionRate: data.summary.overallConversionRate,
          activeReferrals: data.summary.activeReferralsCount,
          activeCampaigns: data.summary.activeCampaignsCount,
          totalCustomers: data.summary.customersCount,
        })
        
        setCampaigns(data.campaigns || [])
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
  
  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
            Completed
          </Badge>
        )
      case "upcoming":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
            Upcoming
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Active
          </Badge>
        )
    }
  }
  
  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }
  
  // Get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "referral":
        return <Users className="h-4 w-4 text-blue-500" />
      case "conversion":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />
    }
  }
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/campaigns/new">
            <Button>Create Campaign</Button>
          </Link>
          <Link href="/referrals/generate">
            <Button variant="outline">Generate Referral Link</Button>
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
            <p className="text-xs text-muted-foreground">
              <Link href="/campaigns" className="text-primary hover:underline">
                View all campaigns
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="md:col-span-2 lg:col-span-2 h-[650px]">
          <AIAssistant userName={session?.user?.name || "there"} />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates from your referral program
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <ul className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              )}
            </CardContent>
          </Card>
          
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
              <Link href="/rewards/custom">
                <Button variant="outline" className="w-full justify-start">
                  <Gift className="mr-2 h-4 w-4" />
                  Create Custom Reward
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Active Campaigns</h2>
          <Link href="/campaigns">
            <Button variant="ghost" className="gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.length > 0 ? (
            campaigns.slice(0, 3).map((campaign) => (
              <Card key={campaign.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{campaign.title}</CardTitle>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <CardDescription>
                    {campaign.startDate} - {campaign.endDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tasks Completed:</span>
                      <span className="font-medium">{campaign.completedTasks}/{campaign.totalTasks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Referrals Generated:</span>
                      <span className="font-medium">{campaign.referrals}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full mt-2">
                      <div 
                        className="h-2 bg-primary rounded-full" 
                        style={{ width: `${(campaign.completedTasks / campaign.totalTasks) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/campaigns/${campaign.id}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Campaign
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-3 py-12 text-center">
              <p className="text-muted-foreground mb-4">No active campaigns</p>
              <Link href="/campaigns/new">
                <Button>Create Your First Campaign</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Coupon Rewards</h2>
          <Link href="/rewards">
            <Button variant="ghost" className="gap-1">
              Manage Rewards
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <CouponRewards />
      </div>
    </div>
  )
} 