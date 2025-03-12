"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { AlertCircle } from "lucide-react"

import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Badge } from "../../components/ui/badge"
import { Icons } from "../../components/icons"
import { toast } from "../../components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"

interface Campaign {
  _id: string
  name: string
  description: string
  startDate: string
  endDate?: string
  rewardType: string
  rewardAmount: number
  referrerRewardType?: string
  referrerRewardAmount?: number
  referrerRewardDescription?: string
  isActive: boolean
  isSelected?: boolean
  businessId: string
  businessName?: string
  companyName?: string
}

// Extend the Session User type to include image and company
interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  role: string
  image?: string | null
  company?: string | null
  businessId?: string | null
}

export default function ReferrerDashboard() {
  const { data: session } = useSession()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  
  // Cast the user to our extended type
  const user = session?.user as ExtendedUser | undefined

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/referrer/campaigns')
        
        if (!response.ok) {
          throw new Error("Failed to fetch campaigns")
        }
        
        const data = await response.json()
        setCampaigns(data)
      } catch (error) {
        console.error("Error fetching campaigns:", error)
        toast({
          title: "Error",
          description: "Failed to load campaigns. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchCampaigns()
    }
  }, [session])

  const handleCampaignSelect = async (campaignId: string) => {
    try {
      const response = await fetch("/api/referrer/select-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to select campaign")
      }

      // Update local state to mark this campaign as selected
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign => 
          campaign._id === campaignId 
            ? { ...campaign, isSelected: true } 
            : campaign
        )
      )

      toast({
        title: "Success",
        description: "Campaign selected successfully. You can now share it with others.",
      })
    } catch (error) {
      console.error("Error selecting campaign:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to select campaign",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/auth/select-role" })
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-[60vh]">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  // Filter campaigns for each tab
  const availableCampaigns = campaigns.filter(campaign => campaign.isActive && !campaign.isSelected)
  const selectedCampaigns = campaigns.filter(campaign => campaign.isSelected)

  return (
    <>
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Available Campaigns</h1>
            <p className="text-muted-foreground mt-2">
              Select campaigns from {user?.company || "your company"} to start referring and earning rewards
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/referrer/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/referrer/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="available" className="space-y-4">
          <TabsList>
            <TabsTrigger value="available">Available Campaigns</TabsTrigger>
            <TabsTrigger value="selected">My Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            {availableCampaigns.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No campaigns available</h3>
                <p className="text-muted-foreground mt-2">
                  There are no active campaigns available from {user?.company || "your company"} at the moment.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {availableCampaigns.map((campaign) => (
                  <Card key={campaign._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{campaign.name}</CardTitle>
                          <CardDescription>{campaign.description}</CardDescription>
                          <Badge variant="outline" className="mt-2">
                            {campaign.businessName || campaign.companyName || "Unknown Business"}
                          </Badge>
                        </div>
                        <Badge variant="outline">Available</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p>{new Date(campaign.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p>
                            {campaign.endDate
                              ? new Date(campaign.endDate).toLocaleDateString()
                              : "No end date"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Customer Reward</p>
                          <p>
                            {campaign.rewardType}: ${campaign.rewardAmount}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Your Reward</p>
                          <p>
                            {campaign.referrerRewardType || "Cash"}: ${campaign.referrerRewardAmount || campaign.rewardAmount * 0.1}
                          </p>
                        </div>
                      </div>
                      {campaign.referrerRewardDescription && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {campaign.referrerRewardDescription}
                        </p>
                      )}
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => window.open(`/campaigns/${campaign._id}`, "_blank")}
                        >
                          View Details
                        </Button>
                        <Button onClick={() => handleCampaignSelect(campaign._id)}>
                          Select Campaign
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="selected">
            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Referral Links</CardTitle>
                  <CardDescription>
                    Create unique referral links for your selected campaigns to share with potential customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Generate personalized referral links that you can share via email, social media, or messaging apps.
                    You'll earn rewards for each successful referral.
                  </p>
                  <Button onClick={() => window.open('/referrals/generate', '_blank')}>
                    Generate Referral Link
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {selectedCampaigns.length === 0 ? (
              <div className="text-center py-10">
                <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No campaigns selected</h3>
                <p className="text-muted-foreground mt-2">
                  You haven't selected any campaigns yet. Select campaigns from the "Available Campaigns" tab to start referring.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {selectedCampaigns.map((campaign) => (
                  <Card key={campaign._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{campaign.name}</CardTitle>
                          <CardDescription>{campaign.description}</CardDescription>
                          <Badge variant="outline" className="mt-2">
                            {campaign.businessName || campaign.companyName || "Unknown Business"}
                          </Badge>
                        </div>
                        <Badge>Selected</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p>{new Date(campaign.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p>
                            {campaign.endDate
                              ? new Date(campaign.endDate).toLocaleDateString()
                              : "No end date"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Customer Reward</p>
                          <p>
                            {campaign.rewardType}: ${campaign.rewardAmount}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Your Reward</p>
                          <p>
                            {campaign.referrerRewardType || "Cash"}: ${campaign.referrerRewardAmount || campaign.rewardAmount * 0.1}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => window.open(`/campaigns/${campaign._id}`, "_blank")}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => window.open(`/referrals/generate?campaignId=${campaign._id}`, "_blank")}
                        >
                          Generate Link
                        </Button>
                        <Button
                          onClick={() => window.open(`/referrer/share/${campaign._id}`, "_blank")}
                        >
                          Share Campaign
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
} 