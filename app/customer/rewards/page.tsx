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

// Reward type
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

  // Fetch rewards on component mount
  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const response = await fetch("/api/customer/rewards")
        const data = await response.json()
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch rewards")
        }
        
        setRewards(data)
      } catch (err) {
        console.error("Error fetching rewards:", err)
        setError("Failed to load rewards. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRewards()
  }, [])

  // Handle reward redemption
  const handleRedeemReward = async () => {
    if (!selectedReward) return
    
    setIsRedeeming(true)
    setError(null)
    setSuccess(null)
    
    try {
      const response = await fetch(`/api/customer/rewards/${selectedReward._id}/redeem`, {
        method: "POST",
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
  const getStatusVariant = (status: string) => {
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
        return `$${amount} Gift`
      default:
        return `${amount} ${type}`
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">My Rewards</h1>
      
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
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
                <Card key={reward._id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {formatRewardAmount(reward.type, reward.amount)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {reward.businessName || reward.companyName || "Unknown Business"}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(reward.status)}>
                        {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-4">{reward.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Reward Code</p>
                        <p className="font-medium">{reward.code}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date Earned</p>
                        <p className="font-medium">
                          {new Date(reward.dateEarned).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/30 px-6 py-4">
                    <Dialog open={redeemDialogOpen && selectedReward?._id === reward._id} onOpenChange={setRedeemDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full"
                          onClick={() => setSelectedReward(reward)}
                        >
                          Redeem Reward
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Redeem Reward</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to redeem this reward?
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="py-4">
                          <div className="rounded-lg border p-4 mb-4">
                            <h3 className="font-medium mb-2">
                              {formatRewardAmount(selectedReward?.type || "", selectedReward?.amount || 0)}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {selectedReward?.description}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">Code:</span>
                              <code className="bg-muted px-2 py-1 rounded">
                                {selectedReward?.code}
                              </code>
                            </div>
                          </div>
                          
                          {error && (
                            <div className="text-sm text-destructive mb-4">
                              {error}
                            </div>
                          )}
                          
                          {success && (
                            <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
                              <Icons.check className="h-4 w-4" />
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
                            disabled={isRedeeming}
                          >
                            {isRedeeming ? (
                              <>
                                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                Redeeming...
                              </>
                            ) : (
                              "Confirm Redemption"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Icons.gift className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No available rewards</h3>
                <p className="text-muted-foreground max-w-md">
                  Share campaigns with others to earn rewards that will appear here.
                </p>
              </CardContent>
            </Card>
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
                <Card key={reward._id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {formatRewardAmount(reward.type, reward.amount)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {reward.businessName || reward.companyName || "Unknown Business"}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(reward.status)}>
                        {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-4">{reward.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Reward Code</p>
                        <p className="font-medium">{reward.code}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date Redeemed</p>
                        <p className="font-medium">
                          {reward.dateRedeemed ? new Date(reward.dateRedeemed).toLocaleDateString() : "Not redeemed"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Icons.check className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No redeemed rewards</h3>
                <p className="text-muted-foreground max-w-md">
                  Rewards you've redeemed will appear here.
                </p>
              </CardContent>
            </Card>
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
                <Card key={reward._id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {formatRewardAmount(reward.type, reward.amount)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {reward.businessName || reward.companyName || "Unknown Business"}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(reward.status)}>
                        {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-4">{reward.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Date Earned</p>
                        <p className="font-medium">
                          {new Date(reward.dateEarned).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium">Awaiting approval</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Icons.spinner className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No pending rewards</h3>
                <p className="text-muted-foreground max-w-md">
                  Rewards that are being processed will appear here.
                </p>
              </CardContent>
            </Card>
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
                <Card key={reward._id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">
                          {formatRewardAmount(reward.type, reward.amount)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {reward.businessName || reward.companyName || "Unknown Business"}
                        </CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(reward.status)}>
                        {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-sm mb-4">{reward.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Date Earned</p>
                        <p className="font-medium">
                          {new Date(reward.dateEarned).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium">Expired</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <Icons.warning className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No expired rewards</h3>
                <p className="text-muted-foreground max-w-md">
                  Rewards that have expired will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}