"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"

interface AnalyticsData {
  timeSeriesData: {
    date: string;
    referralCount: number;
    clickCount: number;
    conversionCount: number;
    conversionRate: number;
    rewardsPaid: number;
  }[];
  summary: {
    totalReferrals: number;
    totalClicks: number;
    totalConversions: number;
    totalRewardsPaid: number;
    overallConversionRate: number;
    activeReferralsCount: number;
    activeCampaignsCount: number;
    customersCount: number;
    dateRange: {
      startDate: string;
      endDate: string;
    };
  };
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState<string>(() => {
    const date = new Date()
    return date.toISOString().split('T')[0]
  })
  const [campaignId, setCampaignId] = useState<string>("")
  
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (status === "authenticated") {
        try {
          setIsLoading(true)
          
          let url = `/api/analytics?startDate=${startDate}&endDate=${endDate}`
          if (campaignId) {
            url += `&campaignId=${campaignId}`
          }
          
          const response = await fetch(url)
          
          if (!response.ok) {
            throw new Error("Failed to fetch analytics data")
          }
          
          const data = await response.json()
          setAnalyticsData(data)
        } catch (error) {
          setError("Error loading analytics data")
          console.error(error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    fetchAnalyticsData()
  }, [status, startDate, endDate, campaignId])
  
  const handleFilterChange = () => {
    // This will trigger the useEffect to fetch data with new filters
  }
  
  if (status === "loading" || isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
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
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <div className="bg-destructive/15 p-4 rounded-md text-destructive">
          {error}
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Analytics</h1>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Start Date</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleFilterChange}>Apply Filters</Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Referrals</CardDescription>
            <CardTitle className="text-3xl">{analyticsData?.summary.totalReferrals || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.summary.activeReferralsCount || 0} active referrals
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Clicks</CardDescription>
            <CardTitle className="text-3xl">{analyticsData?.summary.totalClicks || 0}</CardTitle>
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
            <CardTitle className="text-3xl">
              {analyticsData?.summary.overallConversionRate.toFixed(1) || "0.0"}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {analyticsData?.summary.totalConversions || 0} total conversions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rewards Paid</CardDescription>
            <CardTitle className="text-3xl">${analyticsData?.summary.totalRewardsPaid || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Total rewards paid to referrers
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Time Series Data */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Referral Performance Over Time</CardTitle>
          <CardDescription>
            Track your referral metrics over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData?.timeSeriesData && analyticsData.timeSeriesData.length > 0 ? (
            <div className="h-80 w-full">
              <div className="text-center text-muted-foreground">
                Chart visualization would go here
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Referrals</th>
                      <th className="py-2 px-4 text-left">Clicks</th>
                      <th className="py-2 px-4 text-left">Conversions</th>
                      <th className="py-2 px-4 text-left">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.timeSeriesData.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="py-2 px-4">{item.referralCount}</td>
                        <td className="py-2 px-4">{item.clickCount}</td>
                        <td className="py-2 px-4">{item.conversionCount}</td>
                        <td className="py-2 px-4">{item.conversionRate.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No data available for the selected time period
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Additional Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer Metrics</CardTitle>
            <CardDescription>
              Overview of your customer base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Total Customers</span>
                <span className="font-medium">{analyticsData?.summary.customersCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Active Campaigns</span>
                <span className="font-medium">{analyticsData?.summary.activeCampaignsCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Average Reward Value</span>
                <span className="font-medium">
                  ${analyticsData?.summary.totalReferrals > 0 
                    ? (analyticsData.summary.totalRewardsPaid / analyticsData.summary.totalReferrals).toFixed(2) 
                    : "0.00"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Referral Source Breakdown</CardTitle>
            <CardDescription>
              Where your referrals are coming from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60 flex items-center justify-center">
              <p className="text-muted-foreground">
                Source breakdown visualization would go here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 