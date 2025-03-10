"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { CheckCircle, Share2, ArrowRight, Gift } from "lucide-react"
import Link from "next/link"
import { Confetti } from "@/app/components/ui/confetti"

interface SuccessPageProps {
  params: {
    campaignId: string
    taskId: string
  }
}

export default function SuccessPage({ params }: SuccessPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [taskData, setTaskData] = useState({
    id: "",
    title: "",
    businessName: "",
    referrerName: "",
    rewardType: "discount" as "discount" | "payout",
    rewardValue: "",
    referralCode: ""
  })
  
  useEffect(() => {
    // In a real app, this would fetch the task completion data from the API
    const fetchTaskData = async () => {
      try {
        setLoading(true)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for demonstration
        setTaskData({
          id: params.taskId,
          title: "Sign up for a free trial",
          businessName: "Acme Corporation",
          referrerName: "John Smith",
          rewardType: "discount",
          rewardValue: "25%",
          referralCode: "NEWUSER25"
        })
        
        setError(null)
      } catch (err) {
        setError("Failed to load task data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTaskData()
  }, [params.campaignId, params.taskId])
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Join ${taskData.businessName}'s Referral Program`,
        text: `I just completed a task with ${taskData.businessName}! Use my referral code ${taskData.referralCode} to get started.`,
        url: window.location.origin
      }).catch(err => {
        console.error('Error sharing:', err)
      })
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(
        `I just completed a task with ${taskData.businessName}! Use my referral code ${taskData.referralCode} to get started. ${window.location.origin}`
      ).then(() => {
        alert('Referral link copied to clipboard!')
      }).catch(err => {
        console.error('Error copying to clipboard:', err)
      })
    }
  }
  
  if (loading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse space-y-8 max-w-md mx-auto">
          <div className="h-8 bg-muted rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container py-10 text-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
          <p className="mb-6">{error}</p>
          <p>Please try again later.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <Confetti />
      
      <div className="max-w-md mx-auto text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Task Completed!</h1>
        <p className="text-muted-foreground">
          You've successfully completed the task for {taskData.businessName}.
        </p>
      </div>
      
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thank You!</CardTitle>
            <CardDescription>
              Your completion has been recorded and {taskData.referrerName} will receive their reward.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <Gift className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium">Reward Sent</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {taskData.referrerName} will receive a {taskData.rewardType === 'discount' ? 'discount' : 'cash reward'} of {taskData.rewardValue} thanks to your completion.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Your Referral Code</h3>
              <div className="flex items-center justify-between bg-muted p-2 rounded">
                <code className="text-sm font-mono">{taskData.referralCode}</code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(taskData.referralCode)
                    alert('Referral code copied!')
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this code with your friends to earn rewards when they complete tasks.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share Your Referral Code
            </Button>
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full">
                Join Referral Program
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <div className="text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
} 