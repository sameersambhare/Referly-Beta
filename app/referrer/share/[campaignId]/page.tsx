"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Copy, Share2, ArrowLeft } from "lucide-react"

import { Button } from "@/app/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Icons } from "@/app/components/icons"
import { toast } from "@/app/components/ui/use-toast"

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
  businessId: string
  businessName?: string
}

export default function ShareCampaignPage() {
  const { campaignId } = useParams()
  const { data: session } = useSession()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [referralLink, setReferralLink] = useState("")
  const [referralCode, setReferralCode] = useState("")
  
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true)
        
        // Fetch campaign details
        const response = await fetch(`/api/referrer/campaigns/${campaignId}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch campaign")
        }
        
        const data = await response.json()
        setCampaign(data)
        
        // Generate referral link and code
        if (session?.user?.id) {
          const baseUrl = window.location.origin
          const refCode = `${session.user.id.substring(0, 6)}-${campaignId.substring(0, 6)}`
          setReferralCode(refCode)
          setReferralLink(`${baseUrl}/ref/${refCode}`)
        }
      } catch (error) {
        console.error("Error fetching campaign:", error)
        toast({
          title: "Error",
          description: "Failed to load campaign details. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (campaignId && session?.user?.id) {
      fetchCampaign()
    }
  }, [campaignId, session])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied!",
          description: `${type} copied to clipboard.`,
        })
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast({
          title: "Error",
          description: "Failed to copy to clipboard.",
          variant: "destructive",
        })
      }
    )
  }

  const shareViaEmail = () => {
    const subject = `Check out this offer from ${campaign?.businessName || 'a business I recommend'}`
    const body = `Hi,\n\nI thought you might be interested in this offer: ${campaign?.name}.\n\nYou can get ${campaign?.rewardType} worth $${campaign?.rewardAmount} by using my referral link: ${referralLink}\n\nEnjoy!`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
  }

  const shareViaWhatsApp = () => {
    const text = `Check out this offer from ${campaign?.businessName || 'a business I recommend'}: ${campaign?.name}. You can get ${campaign?.rewardType} worth $${campaign?.rewardAmount} by using my referral link: ${referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
  }

  const shareViaTwitter = () => {
    const text = `I recommend checking out ${campaign?.name} from ${campaign?.businessName || 'this business'}. Get ${campaign?.rewardType} worth $${campaign?.rewardAmount} using my referral link:`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`)
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

  if (!campaign) {
    return (
      <div className="container py-10">
        <div className="text-center py-10">
          <h3 className="text-lg font-medium">Campaign not found</h3>
          <p className="text-muted-foreground mt-2">
            The campaign you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button asChild className="mt-4">
            <Link href="/referrer/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="mb-8">
        <Link href="/referrer/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Share Campaign</h1>
        <p className="text-muted-foreground mt-2">
          Share this campaign with potential customers and earn rewards
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{campaign.name}</CardTitle>
            <CardDescription>{campaign.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>Share this link with potential customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input value={referralLink} readOnly />
              <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink, "Link")}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Referral Code</p>
              <div className="flex space-x-2">
                <Input value={referralCode} readOnly />
                <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralCode, "Code")}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <p className="text-sm font-medium">Share via</p>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={shareViaEmail}>
                <Icons.mail className="mr-2 h-4 w-4" />
                Email
              </Button>
              <Button variant="outline" onClick={shareViaWhatsApp}>
                <Icons.messageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </Button>
              <Button variant="outline" onClick={shareViaTwitter}>
                <Icons.twitter className="mr-2 h-4 w-4" />
                Twitter
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Tracking & Analytics</CardTitle>
          <CardDescription>Track the performance of your referrals</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="stats">
            <TabsList>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="referrals">Referrals</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
            </TabsList>
            <TabsContent value="stats" className="py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$0.00</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="referrals" className="py-4">
              <div className="text-center py-10">
                <Share2 className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No referrals yet</h3>
                <p className="text-muted-foreground mt-2">
                  Start sharing your referral link to see referrals here.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="earnings" className="py-4">
              <div className="text-center py-10">
                <Icons.dollarSign className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No earnings yet</h3>
                <p className="text-muted-foreground mt-2">
                  You'll see your earnings here once your referrals convert.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
} 