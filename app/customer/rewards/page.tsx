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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { 
  AlertTriangle, 
  Check, 
  Clock, 
  Gift, 
  Inbox,
  Search
} from "lucide-react"

// Reward type from database
type Reward = {
  _id: string
  type: string
  amount: number
  status: "pending" | "available" | "redeemed" | "expired"
  description: string
  code: string
  businessName?: string
  companyName?: string
  dateEarned: string
  dateRedeemed: string | null
  campaignId?: string
  campaignName?: string
  expiryDate?: string
}

export default function CustomerRewards() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Fetch rewards from database
  useEffect(() => {
    const fetchRewards = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        if (!session?.user) {
          throw new Error("You must be logged in to view rewards")
        }

        const response = await fetch("/api/customer/rewards")
        
        if (!response.ok) {
          throw new Error(`Error fetching rewards: ${response.statusText}`)
        }
        
        const data = await response.json()
        setRewards(data.rewards || [])
      } catch (err) {
        console.error("Error fetching rewards:", err)
        setError("Failed to load rewards. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    
    if (session) {
      fetchRewards()
    }
  }, [session])

  // Handle reward selection
  const handleSelectReward = (reward: Reward) => {
    setSelectedReward(reward)
  }

  // Handle reward redemption
  const handleRedeemReward = async () => {
    if (!selectedReward) return
    
    setIsRedeeming(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch(`/api/customer/rewards/${selectedReward._id}/redeem`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to redeem reward")
      }
      
      // Update the reward in the list
      setRewards(rewards.map(reward => 
        reward._id === selectedReward._id 
          ? { ...reward, status: "redeemed", dateRedeemed: new Date().toISOString() } 
          : reward
      ))
      
      setSuccess("Reward redeemed successfully!")
      
      // Close the dialog after a short delay
      setTimeout(() => {
        setRedeemDialogOpen(false)
      }, 2000)
      
    } catch (err) {
      console.error("Error redeeming reward:", err)
      setError("Failed to redeem the reward. Please try again.")
    } finally {
      setIsRedeeming(false)
    }
  }

  // Filter rewards by status
  const availableRewards = rewards.filter(reward => reward.status === "available")
  const redeemedRewards = rewards.filter(reward => reward.status === "redeemed")
  const pendingRewards = rewards.filter(reward => reward.status === "pending")
  const expiredRewards = rewards.filter(reward => reward.status === "expired")

  // Get status badge variant
  const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "available":
        return "default"
      case "redeemed":
        return "secondary"
      case "pending":
        return "outline"
      case "expired":
        return "destructive"
      default:
        return "outline"
    }
  }

  // Format reward amount
  const formatRewardAmount = (type: string, amount: number) => {
    switch (type) {
      case "discount":
        return `${amount}% Discount`
      case "cashback":
        return `$${amount} Cashback`
      case "points":
        return `${amount} Points`
      case "gift":
        return `$${amount} Gift Card`
      default:
        return `${amount} ${type}`
    }
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">My Rewards</h1>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="available">
            Available ({availableRewards.length})
          </TabsTrigger>
          <TabsTrigger value="redeemed">
            Redeemed ({redeemedRewards.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingRewards.length})
          </TabsTrigger>
          <TabsTrigger value="expired">
            Expired ({expiredRewards.length})
          </TabsTrigger>
        </TabsList>
        
        {/* Available rewards */}
        <TabsContent value="available">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : availableRewards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableRewards.map((reward) => (
                <RewardCard 
                  key={reward._id} 
                  reward={reward} 
                  isSelected={selectedReward?._id === reward._id}
                  onSelect={() => handleSelectReward(reward)}
                  onRedeem={() => {
                    setSelectedReward(reward)
                    setRedeemDialogOpen(true)
                  }}
                  formatRewardAmount={formatRewardAmount}
                  formatDate={formatDate}
                  getStatusVariant={getStatusVariant}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="You don't have any available rewards" />
          )}
        </TabsContent>
        
        {/* Redeemed rewards */}
        <TabsContent value="redeemed">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : redeemedRewards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {redeemedRewards.map((reward) => (
                <RewardCard 
                  key={reward._id} 
                  reward={reward} 
                  isSelected={selectedReward?._id === reward._id}
                  onSelect={() => handleSelectReward(reward)}
                  formatRewardAmount={formatRewardAmount}
                  formatDate={formatDate}
                  getStatusVariant={getStatusVariant}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="You haven't redeemed any rewards yet" />
          )}
        </TabsContent>
        
        {/* Pending rewards */}
        <TabsContent value="pending">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : pendingRewards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingRewards.map((reward) => (
                <RewardCard 
                  key={reward._id} 
                  reward={reward} 
                  isSelected={selectedReward?._id === reward._id}
                  onSelect={() => handleSelectReward(reward)}
                  formatRewardAmount={formatRewardAmount}
                  formatDate={formatDate}
                  getStatusVariant={getStatusVariant}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="You don't have any pending rewards" />
          )}
        </TabsContent>
        
        {/* Expired rewards */}
        <TabsContent value="expired">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : expiredRewards.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expiredRewards.map((reward) => (
                <RewardCard 
                  key={reward._id} 
                  reward={reward} 
                  isSelected={selectedReward?._id === reward._id}
                  onSelect={() => handleSelectReward(reward)}
                  formatRewardAmount={formatRewardAmount}
                  formatDate={formatDate}
                  getStatusVariant={getStatusVariant}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="You don't have any expired rewards" />
          )}
        </TabsContent>
      </Tabs>
      
      {/* Selected Reward Details Section */}
      {selectedReward && (
        <div className="mt-10 border rounded-lg p-6 bg-card">
          <h2 className="text-2xl font-bold mb-4">
            {formatRewardAmount(selectedReward.type, selectedReward.amount)}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Reward Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-muted-foreground">Business:</span>
                  <p className="font-medium">{selectedReward.businessName || selectedReward.companyName || "Unknown Business"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Description:</span>
                  <p>{selectedReward.description}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Reward Code:</span>
                  <p className="font-mono bg-muted p-2 rounded mt-1">{selectedReward.code}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={getStatusVariant(selectedReward.status)} className="ml-2">
                    {selectedReward.status.charAt(0).toUpperCase() + selectedReward.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Timeline</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-muted-foreground">Date Earned:</span>
                  <p>{formatDate(selectedReward.dateEarned)}</p>
                </div>
                {selectedReward.dateRedeemed && (
                  <div>
                    <span className="text-muted-foreground">Date Redeemed:</span>
                    <p>{formatDate(selectedReward.dateRedeemed)}</p>
                  </div>
                )}
                {selectedReward.expiryDate && (
                  <div>
                    <span className="text-muted-foreground">Expiry Date:</span>
                    <p>{formatDate(selectedReward.expiryDate)}</p>
                  </div>
                )}
                {selectedReward.campaignName && (
                  <div>
                    <span className="text-muted-foreground">Campaign:</span>
                    <p>{selectedReward.campaignName}</p>
                  </div>
                )}
              </div>
              
              {selectedReward.status === "available" && (
                <div className="mt-6">
                  <Button 
                    className="w-full"
                    onClick={() => setRedeemDialogOpen(true)}
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Redeem Reward
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Redeem Dialog */}
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Reward</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem this reward?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedReward && (
              <div className="rounded-lg border p-4 mb-4">
                <h3 className="font-medium mb-2">
                  {formatRewardAmount(selectedReward.type, selectedReward.amount)}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedReward.description}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Code:</span>
                  <code className="bg-muted px-2 py-1 rounded">
                    {selectedReward.code}
                  </code>
                </div>
              </div>
            )}
            
            {error && (
              <div className="text-sm text-destructive mb-4 p-3 border border-destructive/20 bg-destructive/10 rounded-md flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            {success && (
              <div className="text-sm text-green-600 mb-4 p-3 border border-green-200 bg-green-50 rounded-md flex items-center gap-2">
                <Check className="h-4 w-4" />
                {success}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRedeemDialogOpen(false)}
              disabled={isRedeeming}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRedeemReward} 
              disabled={isRedeeming || !selectedReward || selectedReward.status !== "available"}
            >
              {isRedeeming ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Redeeming...
                </>
              ) : (
                "Redeem Now"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Reward Card Component
function RewardCard({ 
  reward, 
  isSelected,
  onSelect, 
  onRedeem,
  formatRewardAmount,
  formatDate,
  getStatusVariant
}: { 
  reward: Reward, 
  isSelected?: boolean,
  onSelect: () => void, 
  onRedeem?: () => void,
  formatRewardAmount: (type: string, amount: number) => string,
  formatDate: (dateString?: string) => string,
  getStatusVariant: (status: string) => string
}) {  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <Gift className="h-4 w-4 mr-1" />;
      case "redeemed":
        return <Check className="h-4 w-4 mr-1" />;
      case "pending":
        return <Clock className="h-4 w-4 mr-1" />;
      case "expired":
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 ${isSelected ? 'border-primary ring-1 ring-primary' : 'hover:border-primary/50'}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{formatRewardAmount(reward.type, reward.amount)}</CardTitle>
            <CardDescription className="text-base mt-1">
              {reward.businessName || reward.companyName || "Unknown Business"}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(reward.status)} className="flex items-center">
            {getStatusIcon(reward.status)}
            {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4 line-clamp-2">{reward.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Reward Code</p>
            <p className="font-mono">{reward.code}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Date Earned</p>
            <p>{formatDate(reward.dateEarned)}</p>
          </div>
        </div>
        {reward.dateRedeemed && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              Redeemed on {formatDate(reward.dateRedeemed)}
            </p>
          </div>
        )}
      </CardContent>
      {reward.status === "available" && onRedeem && (
        <CardFooter className="border-t px-6 py-4">
          <Button 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              onRedeem();
            }}
          >
            <Gift className="mr-2 h-4 w-4" />
            Redeem Reward
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}

// Empty State Component
function EmptyState({ message }: { message: string }) {
  return (
    <div className="border rounded-lg flex flex-col items-center justify-center py-16 px-4 text-center">
      <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No Rewards Found</h3>
      <p className="text-muted-foreground max-w-md mb-6">{message}</p>
      <Link href="/customer/campaigns">
        <Button>
          <Search className="mr-2 h-4 w-4" />
          Find Campaigns
        </Button>
      </Link>
    </div>
  )
}