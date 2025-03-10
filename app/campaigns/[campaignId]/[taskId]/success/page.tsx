"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { CheckCircle, Share } from "lucide-react"
import Link from "next/link"

interface SuccessPageProps {
  params: {
    campaignId: string
    taskId: string
  }
}

export default function SuccessPage({ params }: SuccessPageProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successData, setSuccessData] = useState({
    businessName: "",
    taskTitle: "",
    referrerName: "",
    rewardType: "",
    rewardValue: "",
  })
  
  useEffect(() => {
    // In a real app, this would fetch the success data from the API
    const fetchSuccessData = async () => {
      try {
        setLoading(true)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for demonstration
        setSuccessData({
          businessName: "Acme Corporation",
          taskTitle: "Sign up for a free trial",
          referrerName: "John Smith",
          rewardType: "discount",
          rewardValue: "25%",
        })
        
        setError(null)
      } catch (err) {
        setError("Failed to load success data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSuccessData()
  }, [params.campaignId, params.taskId])
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `I just completed a task for ${successData.businessName}!`,
        text: `I just helped my friend ${successData.referrerName} by completing a task for ${successData.businessName}. You should check them out too!`,
        url: window.location.origin,
      })
        .then(() => console.log("Shared successfully"))
        .catch((error) => console.log("Error sharing:", error))
    } else {
      console.log("Web Share API not supported")
      // Fallback for browsers that don't support the Web Share API
      alert("Copy this link to share: " + window.location.origin)
    }
  }
  
  if (loading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
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
          <Link href={`/campaigns/${params.campaignId}`}>
            <Button>Back to Campaign</Button>
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10 flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Task Completed!</CardTitle>
          <CardDescription>
            Thank you for completing the task
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="font-medium text-lg">
            {successData.taskTitle}
          </p>
          <p>
            You've successfully completed this task for {successData.businessName}.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm mb-2">
              Your friend {successData.referrerName} will receive a {successData.rewardValue} {successData.rewardType} thanks to your help!
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleShare}>
            <Share className="mr-2 h-4 w-4" />
            Share with Friends
          </Button>
          <Link href={`/campaigns/${params.campaignId}`} className="w-full">
            <Button variant="outline" className="w-full">
              View More Tasks
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
} 