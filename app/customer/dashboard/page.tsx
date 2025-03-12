"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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

// Form schema for link input
const linkFormSchema = z.object({
  referralLink: z.string().url("Please enter a valid URL"),
})

// Campaign type
type Campaign = {
  _id: string
  name: string
  description: string
  businessName: string
  companyName?: string
  rewardType: string
  rewardAmount: number
  startDate: string
  endDate: string
  isActive: boolean
  isSelected?: boolean
}

export default function CustomerDashboard() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [referredCampaigns, setReferredCampaigns] = useState<Campaign[]>([])
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [shareMethod, setShareMethod] = useState<string | null>(null)
  const [isShared, setIsShared] = useState(false)
  const [isShareLoading, setIsShareLoading] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)
  const [shareSuccess, setShareSuccess] = useState<string | null>(null)
  const [isLoadingReferred, setIsLoadingReferred] = useState(false)

  // Initialize form
  const form = useForm<z.infer<typeof linkFormSchema>>({
    resolver: zodResolver(linkFormSchema),
    defaultValues: {
      referralLink: "",
    },
  })

  // Check for referral code in URL
  useEffect(() => {
    const processReferralFromUrl = async () => {
      if (!session?.user) return;
      
      // Get referral code from URL if present
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('ref');
      
      if (!code) return;
      
      setIsLoading(true)
      setError(null)
      setSuccess(null)
      
      try {
        console.log("Processing referral code from URL:", code)
        
        // Call the API to process the referral code
        const response = await fetch("/api/customer/process-link", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        })
        
        const data = await response.json()
        
        if (!response.ok) {
          setError(data.error || "Failed to process referral link")
          console.error("Error processing referral link:", data.error)
          return
        }
        
        // Add the campaign to the list
        setActiveCampaign(data)
        setCampaigns(prev => {
          // Check if campaign already exists
          const exists = prev.some(c => c._id === data._id)
          if (exists) return prev
          return [...prev, data]
        })
        setSuccess("Referral link processed successfully!")
        
        // Remove the ref parameter from URL without refreshing the page
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('ref')
        window.history.replaceState({}, document.title, newUrl.toString())
        
      } catch (err) {
        console.error("Error processing referral link from URL:", err)
        setError("Failed to process the referral link. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      processReferralFromUrl()
    }
  }, [session])

  // Fetch referred campaigns on component mount
  useEffect(() => {
    const fetchReferredCampaigns = async () => {
      if (!session?.user) return;
      
      try {
        setIsLoadingReferred(true)
        const response = await fetch("/api/customer/referred-campaigns")
        
        if (!response.ok) {
          console.error("Failed to fetch referred campaigns:", await response.text())
          return
        }
        
        const data = await response.json()
        console.log("Referred campaigns:", data)
        setReferredCampaigns(data)
      } catch (err) {
        console.error("Error fetching referred campaigns:", err)
      } finally {
        setIsLoadingReferred(false)
      }
    }

    fetchReferredCampaigns()
  }, [session])

  // Handle form submission
  async function onSubmit(values: z.infer<typeof linkFormSchema>) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      console.log("Processing referral link:", values.referralLink)
      
      // Call the API to process the referral link
      const response = await fetch("/api/customer/process-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ referralLink: values.referralLink }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || "Failed to process referral link")
        console.error("Error processing referral link:", data.error)
        return
      }
      
      // Add the campaign to the list
      setActiveCampaign(data)
      setCampaigns([data])
      setSuccess("Referral link processed successfully!")
      
      // Reset the form
      form.reset()
      
    } catch (err) {
      console.error("Error processing referral link:", err)
      setError("Failed to process the referral link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle sharing campaign
  const handleShare = async (method: string) => {
    if (!activeCampaign) return
    
    setIsShareLoading(true)
    setShareError(null)
    setShareSuccess(null)
    setShareMethod(method)
    
    try {
      // Call the API to share the campaign
      const response = await fetch("/api/customer/share-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: activeCampaign._id,
          shareMethod: method,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setShareError(data.error || "Failed to share campaign")
        console.error("Error sharing campaign:", data.error)
        return
      }
      
      setIsShared(true)
      setShareSuccess(data.message || "Campaign shared successfully!")
      
      // Update the campaign in the list
      setCampaigns(campaigns.map(c => 
        c._id === activeCampaign._id 
          ? { ...c, isShared: true } 
          : c
      ))
      
    } catch (err) {
      console.error("Error sharing campaign:", err)
      setShareError("Failed to share the campaign. Please try again.")
    } finally {
      setIsShareLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Customer Dashboard</h1>
      
      {/* Referred Campaigns Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Your Referred Campaigns</h2>
        {isLoadingReferred ? (
          <div className="flex justify-center py-8">
            <Icons.spinner className="h-8 w-8 animate-spin" />
          </div>
        ) : referredCampaigns.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {referredCampaigns.map((campaign) => (
              <Card key={campaign._id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle>{campaign.name}</CardTitle>
                  <CardDescription>
                    {campaign.businessName || campaign.companyName || "Unknown Business"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{campaign.description}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Reward</p>
                      <p>{campaign.rewardType}: ${campaign.rewardAmount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valid Until</p>
                      <p>{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : "No end date"}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 pt-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setActiveCampaign(campaign)
                      setShareDialogOpen(true)
                    }}
                  >
                    Share with Friends
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't been referred to any campaigns yet. Enter a referral link below or ask a friend for one.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Existing Enter Referral Link Section */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Enter Referral Link</h2>
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {session?.user?.name || "Customer"}!</CardTitle>
            <CardDescription>
              Paste a referral link to view campaign details and share with others
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="referralLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referral Link</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="https://referly.com/r/abc123" 
                            disabled={isLoading} 
                            {...field} 
                            className="flex-1"
                          />
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                              <>
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Process Link"
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mt-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Active campaigns */}
      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
            <CardDescription>
              Campaigns you can share with others to earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign._id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{campaign.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {campaign.businessName || campaign.companyName || "Unknown Business"}
                        </CardDescription>
                      </div>
                      <Badge variant={campaign.isActive ? "default" : "outline"}>
                        {campaign.isActive ? "Active" : "Inactive"}
                      </Badge>
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
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/30 px-6 py-4">
                    <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            setActiveCampaign(campaign)
                            setIsShared(false)
                            setShareMethod(null)
                            setShareError(null)
                            setShareSuccess(null)
                          }}
                        >
                          <Icons.share className="mr-2 h-4 w-4" />
                          Share Campaign
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Share Campaign</DialogTitle>
                          <DialogDescription>
                            Choose how you want to share this campaign with others
                          </DialogDescription>
                        </DialogHeader>
                        
                        {shareError && (
                          <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{shareError}</AlertDescription>
                          </Alert>
                        )}
                        
                        {shareSuccess && (
                          <Alert className="mt-4">
                            <AlertDescription>{shareSuccess}</AlertDescription>
                          </Alert>
                        )}
                        
                        {isShared ? (
                          <div className="py-6 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                              <Icons.check className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="mb-2 text-lg font-medium">Campaign Shared!</h3>
                            <p className="text-muted-foreground">
                              You've successfully shared this campaign via {shareMethod}
                            </p>
                            <p className="text-muted-foreground mt-2">
                              Check your rewards page to see your earned reward!
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <Button 
                              variant="outline" 
                              className="flex flex-col h-24 items-center justify-center gap-2"
                              onClick={() => handleShare("Email")}
                              disabled={isShareLoading}
                            >
                              {isShareLoading && shareMethod === "Email" ? (
                                <Icons.spinner className="h-8 w-8 animate-spin" />
                              ) : (
                                <Icons.mail className="h-8 w-8" />
                              )}
                              <span>Email</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex flex-col h-24 items-center justify-center gap-2"
                              onClick={() => handleShare("SMS")}
                              disabled={isShareLoading}
                            >
                              {isShareLoading && shareMethod === "SMS" ? (
                                <Icons.spinner className="h-8 w-8 animate-spin" />
                              ) : (
                                <Icons.messageSquare className="h-8 w-8" />
                              )}
                              <span>SMS</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex flex-col h-24 items-center justify-center gap-2"
                              onClick={() => handleShare("WhatsApp")}
                              disabled={isShareLoading}
                            >
                              {isShareLoading && shareMethod === "WhatsApp" ? (
                                <Icons.spinner className="h-8 w-8 animate-spin" />
                              ) : (
                                <Icons.phone className="h-8 w-8" />
                              )}
                              <span>WhatsApp</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              className="flex flex-col h-24 items-center justify-center gap-2"
                              onClick={() => handleShare("Social Media")}
                              disabled={isShareLoading}
                            >
                              {isShareLoading && shareMethod === "Social Media" ? (
                                <Icons.spinner className="h-8 w-8 animate-spin" />
                              ) : (
                                <Icons.share className="h-8 w-8" />
                              )}
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
                              disabled={isShareLoading}
                            >
                              Cancel
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Empty state */}
      {campaigns.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>No Active Campaigns</CardTitle>
            <CardDescription>
              Paste a referral link above to view campaign details
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Icons.link className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
            <p className="text-muted-foreground max-w-md">
              Paste a referral link in the form above to view campaign details and start sharing with others.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 