"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { AIAssistant } from "@/app/components/dashboard/AIAssistant"
import { CouponRewards } from "@/app/components/dashboard/CouponRewards"
import { Badge } from "@/app/components/ui/badge"
import { ArrowRight, Users, Calendar, Gift, CheckCircle } from "lucide-react"

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/analytics")
          
          if (!response.ok) {
            throw new Error("Failed to fetch dashboard data")
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
          
          // Mock campaign data for demonstration
          setCampaigns([
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
          ])
        } catch (error) {
          setError("Error loading dashboard data")
          console.error(error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
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
        <div className="bg-destructive/15 p-4 rounded-md text-destructive">
          {error}
        </div>
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
        <div className="md:col-span-2 h-[600px]">
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
                Add Customer
              </Button>
            </Link>
            <Link href="/follow-ups/new">
              <Button variant="outline" className="w-full justify-start">
                Schedule Follow-up
              </Button>
            </Link>
            <Link href="/customers/import">
              <Button variant="outline" className="w-full justify-start">
                Import Customers
              </Button>
            </Link>
            <Link href="/analytics">
              <Button variant="outline" className="w-full justify-start">
                View Analytics
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="outline" className="w-full justify-start">
                Manage Campaigns
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Referral Campaigns</CardTitle>
                  <CardDescription>
                    Manage your ongoing referral campaigns and tasks
                  </CardDescription>
                </div>
                <Link href="/dashboard/campaigns">
                  <Button variant="ghost" size="sm" className="gap-1">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.filter(c => c.status === "active").map((campaign) => (
                  <div key={campaign.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{campaign.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(campaign.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{campaign.referrals} referrals</span>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(campaign.status)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="text-muted-foreground">Task completion:</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(campaign.completedTasks / campaign.totalTasks) * 100}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground">{campaign.completedTasks}/{campaign.totalTasks}</span>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/campaigns/${campaign.id}/tasks`}>
                        <Button variant="outline" size="sm">Manage Tasks</Button>
                      </Link>
                      <Link href={`/dashboard/campaigns/${campaign.id}`}>
                        <Button size="sm">View Details</Button>
                      </Link>
                    </div>
                  </div>
                ))}
                
                {campaigns.filter(c => c.status === "active").length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No active campaigns</p>
                    <Link href="/campaigns/new">
                      <Button>Create a Campaign</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Reward Management</CardTitle>
            <CardDescription>
              Track and manage your referral rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/rewards/history">
              <Button variant="outline" className="w-full justify-start">
                Reward History
              </Button>
            </Link>
            <Link href="/rewards/settings">
              <Button variant="outline" className="w-full justify-start">
                Reward Settings
              </Button>
            </Link>
            <Link href="/rewards/custom">
              <Button variant="outline" className="w-full justify-start">
                Create Custom Reward
              </Button>
            </Link>
            <Link href="/rewards">
              <Button variant="outline" className="w-full justify-start">
                View All Rewards
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CouponRewards />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Task Completions</CardTitle>
            <CardDescription>
              Latest tasks completed by referred users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Sign up for a free trial</p>
                  <p className="text-xs text-muted-foreground">Completed by Sarah J. • 2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Complete profile information</p>
                  <p className="text-xs text-muted-foreground">Completed by Michael T. • 5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Make first purchase</p>
                  <p className="text-xs text-muted-foreground">Completed by Alex R. • 1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/task-completions" className="w-full">
              <Button variant="outline" className="w-full">
                View All Completions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 