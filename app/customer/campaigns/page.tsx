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
import { Separator } from "@/components/ui/separator"

// Mock campaign type (replace with actual type from your API)
type Campaign = {
  id: string
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
}

export default function CustomerCampaigns() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [shareMethod, setShareMethod] = useState<string | null>(null)
  const [isShared, setIsShared] = useState(false)

  // Fetch campaigns on component mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsLoading(true)
      try {
        // In a real implementation, this would be an API call
        // For now, we'll simulate with mock data
        const mockCampaigns: Campaign[] = [
          {
            id: "camp1",
            name: "Summer Promotion",
            description: "Get 20% off your first purchase",
            businessName: "Example Store",
            rewardType: "discount",
            rewardAmount: 20,
            startDate: "2023-06-01",
            endDate: "2023-08-31",
            isActive: true,
            isShared: true,
            shareMethod: "Email",
            shareDate: "2023-07-15"
          },
          {
            id: "camp2",
            name: "Referral Bonus",
            description: "Refer a friend and get $10 cash reward",
            businessName: "Sample Company",
            rewardType: "cash",
            rewardAmount: 10,
            startDate: "2023-05-01",
            endDate: "2023-12-31",
            isActive: true,
            isShared: false
          }
        ]
        
        setCampaigns(mockCampaigns)
      } catch (err) {
        console.error("Error fetching campaigns:", err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCampaigns()
  }, [])

  // Handle sharing campaign
  const handleShare = (campaign: Campaign, method: string) => {
    setSelectedCampaign(campaign)
    setShareMethod(method)
    
    // In a real implementation, this would handle the actual sharing
    // For now, we'll just simulate the process
    setTimeout(() => {
      setIsShared(true)
      // Update the campaign in the list
      setCampaigns(campaigns.map(c => 
        c.id === campaign.id 
          ? { 
              ...c, 
              isShared: true, 
              shareMethod: method, 
              shareDate: new Date().toISOString().split('T')[0] 
            } 
          : c
      ))
      
      // In a real implementation, you would mark the campaign as shared via API
      // await fetch("/api/customer/campaigns/share", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ campaignId: campaign.id, shareMethod: method }),
      // })
    }, 1000)
  }

  // Filter campaigns by status
  const activeCampaigns = campaigns.filter(campaign => campaign.isActive)
  const sharedCampaigns = campaigns.filter(campaign => campaign.isShared)

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">My Campaigns</h1>
      
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
                  key={campaign.id} 
                  campaign={campaign} 
                  onShare={(method) => {
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
                  key={campaign.id} 
                  campaign={campaign} 
                  onShare={(method) => {
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
                  key={campaign.id} 
                  campaign={campaign} 
                  onShare={(method) => {
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
                <Icons.mail className="h-8 w-8" />
                <span>Email</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2"
                onClick={() => selectedCampaign && handleShare(selectedCampaign, "SMS")}
              >
                <Icons.messageSquare className="h-8 w-8" />
                <span>SMS</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2"
                onClick={() => selectedCampaign && handleShare(selectedCampaign, "WhatsApp")}
              >
                <Icons.phone className="h-8 w-8" />
                <span>WhatsApp</span>
              </Button>
              <Button 
                variant="outline" 
                className="flex flex-col h-24 items-center justify-center gap-2"
                onClick={() => selectedCampaign && handleShare(selectedCampaign, "Social Media")}
              >
                <Icons.share className="h-8 w-8" />
                <span>Social Media</span>
              </Button>
            </div>
          )}
          
          <DialogFooter>
            {isShared ? (
              <Button 
                onClick={() => {
                  setShareDialogOpen(false)
                  setIsShared(false)
                  setShareMethod(null)
                }}
              >
                Done
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setShareDialogOpen(false)}
              >
                Cancel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Campaign Card Component
function CampaignCard({ 
  campaign, 
  onShare 
}: { 
  campaign: Campaign, 
  onShare: (method: string) => void 
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{campaign.name}</CardTitle>
            <CardDescription className="mt-1">
              {campaign.businessName}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={campaign.isActive ? "default" : "outline"}>
              {campaign.isActive ? "Active" : "Inactive"}
            </Badge>
            {campaign.isShared && (
              <Badge variant="secondary">Shared</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm mb-4">{campaign.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Reward</p>
            <p className="font-medium">
              {campaign.rewardType === "discount" 
                ? `${campaign.rewardAmount}% Discount` 
                : `$${campaign.rewardAmount} Cash`}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Valid Until</p>
            <p className="font-medium">
              {new Date(campaign.endDate).toLocaleDateString()}
            </p>
          </div>
          {campaign.isShared && (
            <>
              <div>
                <p className="text-muted-foreground">Shared Via</p>
                <p className="font-medium">{campaign.shareMethod}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Shared On</p>
                <p className="font-medium">
                  {campaign.shareDate && new Date(campaign.shareDate).toLocaleDateString()}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/30 px-6 py-4">
        <Button 
          className="w-full" 
          disabled={!campaign.isActive}
          onClick={() => onShare("email")}
        >
          <Icons.share className="mr-2 h-4 w-4" />
          {campaign.isShared ? "Share Again" : "Share Campaign"}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-muted p-6 mb-4">
          <Icons.megaphone className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
        <p className="text-muted-foreground max-w-md">
          {message}
        </p>
      </CardContent>
    </Card>
  )
} 