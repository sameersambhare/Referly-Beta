"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { AIAssistant } from "@/app/components/dashboard/AIAssistant"

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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="md:col-span-2 h-[500px]">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 