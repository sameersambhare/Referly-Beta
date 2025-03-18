"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Icons } from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  HelpCircle, 
  Inbox, 
  Mail, 
  MessageSquare,
  Phone,
  Search,
  Share
} from "lucide-react"

// Campaign type from database
type Campaign = {
  _id: string
  name: string
  description: string
  businessName: string
  rewardType: string
  rewardAmount: number
  startDate: string
  endDate: string
  isActive: boolean
  isShared: boolean
  shareMethod?: string
  shareDate?: string
  businessId: string
  createdAt: string
  updatedAt: string
}

export default function CustomerCampaigns() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [shareMethod, setShareMethod] = useState<string | null>(null)
  const [isShared, setIsShared] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch campaigns from database
  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch campaigns from API
        const response = await fetch('/api/customer/campaigns')
        
        if (!response.ok) {
          throw new Error(`Error fetching campaigns: ${response.statusText}`)
        }
        
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      } catch (err) {
        console.error("Error fetching campaigns:", err)
        setError("Failed to load campaigns. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (session) {
      fetchCampaigns()
    }
  }, [session])

  // Handle campaign selection
  const handleSelectCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
  }

  // Handle sharing campaign
  const handleShare = async (campaign: Campaign, method: string) => {
    setSelectedCampaign(campaign)
    setShareMethod(method)
    setIsShared(false)
    
    try {
      // Make API call to share the campaign
      const response = await fetch("/api/customer/share-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          campaignId: campaign._id, 
          shareMethod: method 
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to share campaign")
      }
      
      setIsShared(true)
      
      // Update the campaign in the list
      setCampaigns(campaigns.map(c => 
        c._id === campaign._id 
          ? { 
              ...c, 
              isShared: true, 
              shareMethod: method, 
              shareDate: new Date().toISOString().split('T')[0] 
            } 
          : c
      ))

      // Show success message with reward details
      const rewardMessage = `Campaign shared successfully! You've earned a ${data.reward.type} reward of ${
        data.reward.type === 'discount' ? `${data.reward.amount}%` : `$${data.reward.amount}`
      }. Your reward code is: ${data.reward.code}`

      // Show success message
      alert(rewardMessage)

      // Redirect to rewards page after a short delay
      setTimeout(() => {
        window.location.href = '/customer/rewards'
      }, 2000)

    } catch (err) {
      console.error("Error sharing campaign:", err)
      alert(err instanceof Error ? err.message : "Failed to share campaign")
    }
  }

  // Filter campaigns by status
  const activeCampaigns = campaigns.filter(campaign => campaign.isActive)
  const sharedCampaigns = campaigns.filter(campaign => campaign.isShared)

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">My Campaigns</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : campaigns.length > 0 ? (
            <div className="grid gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign._id} 
                  campaign={campaign}
                  isSelected={selectedCampaign?._id === campaign._id}
                  onSelect={() => handleSelectCampaign(campaign)}
                  onShare={() => {
                    setSelectedCampaign(campaign)
                    setShareDialogOpen(true)
                  }} 
                />
              ))}
            </div>
          ) : (
            <EmptyState message="You haven't interacted with any campaigns yet" />
          )}
        </TabsContent>
        
        <TabsContent value="active">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : activeCampaigns.length > 0 ? (
            <div className="grid gap-6">
              {activeCampaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign._id} 
                  campaign={campaign}
                  isSelected={selectedCampaign?._id === campaign._id}
                  onSelect={() => handleSelectCampaign(campaign)}
                  onShare={() => {
                    setSelectedCampaign(campaign)
                    setShareDialogOpen(true)
                  }} 
                />
              ))}
            </div>
          ) : (
            <EmptyState message="You don't have any active campaigns" />
          )}
        </TabsContent>
        
        <TabsContent value="shared">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : sharedCampaigns.length > 0 ? (
            <div className="grid gap-6">
              {sharedCampaigns.map((campaign) => (
                <CampaignCard 
                  key={campaign._id} 
                  campaign={campaign}
                  isSelected={selectedCampaign?._id === campaign._id}
                  onSelect={() => handleSelectCampaign(campaign)}
                  onShare={() => {
                    setSelectedCampaign(campaign)
                    setShareDialogOpen(true)
                  }} 
                />
              ))}
            </div>
          ) : (
            <EmptyState message="You haven't shared any campaigns yet" />
          )}
        </TabsContent>
      </Tabs>
      
      {/* Campaign Details Section */}
      {selectedCampaign && (
        <div className="mt-10 border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-bold mb-4">{selectedCampaign.name}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Campaign Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-muted-foreground">Business:</span>
                  <p className="font-medium">{selectedCampaign.businessName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p>{selectedCampaign.description}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>
                  <p>{new Date(selectedCampaign.startDate).toLocaleDateString()} - {new Date(selectedCampaign.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={selectedCampaign.isActive ? "default" : "secondary"}>
                    {selectedCampaign.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Reward Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-muted-foreground">Reward Type:</span>
                  <p className="font-medium capitalize">{selectedCampaign.rewardType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Reward Value:</span>
                  <p className="font-medium">
                    {selectedCampaign.rewardType === 'discount' 
                      ? `${selectedCampaign.rewardAmount}% off` 
                      : `$${selectedCampaign.rewardAmount}`}
                  </p>
                </div>
                
                {selectedCampaign.isShared && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Shared via:</span>
                      <p>{selectedCampaign.shareMethod || 'Unknown'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Share Date:</span>
                      <p>{selectedCampaign.shareDate ? new Date(selectedCampaign.shareDate).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                  </>
                )}
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => setShareDialogOpen(true)}
                >
                  <Share className="mr-2 h-4 w-4" />
                  Share Campaign
                </Button>
                
                <Button
                  variant="outline"
                  className="flex-1"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  How It Works
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Campaign</DialogTitle>
            <DialogDescription>
              Choose how you want to share this campaign with others
            </DialogDescription>
          </DialogHeader>
          
          {isShared ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Icons.check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-medium">Campaign Shared!</h3>
              <p className="text-muted-foreground">
                You've successfully shared this campaign via {shareMethod}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 py-4">
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2"
                onClick={() => selectedCampaign && handleShare(selectedCampaign, "Email")}
              >
                <Mail className="h-8 w-8" />
                <span>Email</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2"
                onClick={() => selectedCampaign && handleShare(selectedCampaign, "SMS")}
              >
                <MessageSquare className="h-8 w-8" />
                <span>SMS</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2"
                onClick={() => selectedCampaign && handleShare(selectedCampaign, "WhatsApp")}
              >
                <Phone className="h-8 w-8" />
                <span>WhatsApp</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2"
                onClick={() => selectedCampaign && handleShare(selectedCampaign, "Social Media")}
              >
                <Share className="h-8 w-8" />
                <span>Social Media</span>
              </Button>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => {
                setShareDialogOpen(false)
                setIsShared(false)
              }}
            >
              {isShared ? "Close" : "Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CampaignCard({ 
  campaign, 
  isSelected,
  onSelect,
  onShare 
}: { 
  campaign: Campaign,
  isSelected?: boolean,
  onSelect: () => void,
  onShare: () => void 
}) {
  // Format date string to readable format
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  return (
    <Card 
      className={`transition-all duration-200 ${isSelected ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{campaign.name}</CardTitle>
            <CardDescription className="text-base mt-1 line-clamp-1">{campaign.description}</CardDescription>
          </div>
          {campaign.isActive ? (
            <Badge variant="default" className="ml-2">Active</Badge>
          ) : (
            <Badge variant="secondary" className="ml-2">Inactive</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Business</p>
            <p className="font-medium">{campaign.businessName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reward</p>
            <p className="font-medium">
              {campaign.rewardType === 'discount' 
                ? `${campaign.rewardAmount}% off` 
                : `$${campaign.rewardAmount}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Start Date</p>
            <p>{formatDate(campaign.startDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">End Date</p>
            <p>{formatDate(campaign.endDate)}</p>
          </div>
        </div>
        
        {campaign.isShared && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              Shared via {campaign.shareMethod} on {campaign.shareDate && formatDate(campaign.shareDate)}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onSelect}>
          View Details
        </Button>
        <Button onClick={(e) => {
          e.stopPropagation();
          onShare();
        }}>
          Share Campaign
        </Button>
      </CardFooter>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border rounded-lg flex flex-col items-center justify-center py-16 px-4 text-center">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No Campaigns Found</h3>
      <p className="text-muted-foreground max-w-md mb-6">{message}</p>
      <Link href="/customer/discover">
        <Button>
          <Search className="mr-2 h-4 w-4" />
          Discover Campaigns
        </Button>
      </Link>
    </div>
  )
} 