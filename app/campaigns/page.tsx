"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"

interface Campaign {
  _id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  rewardType: 'cash' | 'discount' | 'gift' | 'points';
  rewardAmount: number;
  rewardDescription?: string;
  referralCount: number;
  conversionCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function CampaignsPage() {
  const { data: session, status } = useSession()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/campaigns")
          
          if (!response.ok) {
            throw new Error("Failed to fetch campaigns")
          }
          
          const data = await response.json()
          setCampaigns(data)
          setFilteredCampaigns(data)
        } catch (error) {
          setError("Error loading campaigns")
          console.error(error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    fetchCampaigns()
  }, [status])
  
  useEffect(() => {
    // Filter campaigns based on search term and active tab
    let filtered = campaigns
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        campaign =>
          campaign.name.toLowerCase().includes(term) ||
          (campaign.description && campaign.description.toLowerCase().includes(term))
      )
    }
    
    // Filter by status
    if (activeTab === "active") {
      filtered = filtered.filter(campaign => campaign.isActive)
    } else if (activeTab === "inactive") {
      filtered = filtered.filter(campaign => !campaign.isActive)
    }
    
    setFilteredCampaigns(filtered)
  }, [searchTerm, activeTab, campaigns])
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }
  
  const getRewardTypeLabel = (type: string) => {
    switch (type) {
      case 'cash':
        return 'Cash';
      case 'discount':
        return 'Discount';
      case 'gift':
        return 'Gift';
      case 'points':
        return 'Points';
      default:
        return type;
    }
  }
  
  if (status === "loading" || isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Campaigns</h1>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Campaigns</h1>
        <div className="bg-destructive/15 p-4 rounded-md text-destructive">
          {error}
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Link href="/campaigns/new">
          <Button>Create Campaign</Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-md"
        />
      </div>
      
      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No campaigns found</p>
              <Link href="/campaigns/new">
                <Button className="mt-4">Create Your First Campaign</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{campaign.name}</CardTitle>
                        <CardDescription>
                          {campaign.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {campaign.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Link href={`/campaigns/${campaign._id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p>{formatDate(campaign.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Date</p>
                        <p>{campaign.endDate ? formatDate(campaign.endDate) : 'No end date'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reward</p>
                        <p>
                          {getRewardTypeLabel(campaign.rewardType)}: ${campaign.rewardAmount}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Performance</p>
                        <p>{campaign.referralCount} referrals, {campaign.conversionCount} conversions</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Link href={`/campaigns/${campaign._id}/edit`}>
                      <Button variant="outline" size="sm">Edit</Button>
                    </Link>
                    <Link href={`/referrals/generate?campaignId=${campaign._id}`}>
                      <Button size="sm">Generate Link</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 