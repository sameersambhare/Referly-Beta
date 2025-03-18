"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TaskList, Task } from "@/app/components/referral/TaskList"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { ArrowLeft, Users, Calendar, Gift } from "lucide-react"
import Link from "next/link"

interface CampaignPageProps {
  params: {
    campaignId: string
  }
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [campaignData, setCampaignData] = useState({
    id: "",
    title: "",
    description: "",
    businessName: "",
    referrerName: "",
    startDate: "",
    endDate: "",
    status: "active" as "active" | "completed" | "upcoming",
    tasks: [] as Task[]
  })
  
  useEffect(() => {
    // In a real app, this would fetch the campaign data from the API
    const fetchCampaignData = async () => {
      try {
        setLoading(true)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for demonstration
        setCampaignData({
          id: params.campaignId,
          title: "Summer Referral Program",
          description: "Complete these tasks to help your friend earn rewards and get special offers yourself!",
          businessName: "Acme Corporation",
          referrerName: "John Smith",
          startDate: "2023-06-01",
          endDate: "2023-08-31",
          status: "active",
          tasks: [
            {
              id: "task1",
              title: "Sign up for a free trial",
              description: "Create an account and confirm your email address to get started with our service.",
              status: "pending",
              campaignId: params.campaignId,
              rewardType: "discount",
              rewardValue: "25%"
            },
            {
              id: "task2",
              title: "Complete your profile",
              description: "Fill out your profile information including your preferences and interests.",
              status: "pending",
              campaignId: params.campaignId,
              rewardType: "discount",
              rewardValue: "10%"
            },
            {
              id: "task3",
              title: "Make your first purchase",
              description: "Complete a purchase of any product or service to qualify for this reward.",
              status: "pending",
              campaignId: params.campaignId,
              rewardType: "payout",
              rewardValue: "$15"
            }
          ]
        })
        
        setError(null)
      } catch (err) {
        setError("Failed to load campaign data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCampaignData()
  }, [params.campaignId])
  
  if (loading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="space-y-4">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-24 bg-muted rounded"></div>
          </div>
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
          <p>Please check the campaign link and try again.</p>
        </div>
      </div>
    )
  }
  
  const getStatusBadge = (status: typeof campaignData.status) => {
    switch (status) {
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      case "upcoming":
        return <Badge variant="outline">Upcoming</Badge>
      default:
        return <Badge variant="default">Active</Badge>
    }
  }
  
  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{campaignData.businessName}</h1>
        <Badge className="ml-4 bg-primary">Referred by {campaignData.referrerName}</Badge>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{campaignData.title}</CardTitle>
                  <CardDescription>{campaignData.description}</CardDescription>
                </div>
                {getStatusBadge(campaignData.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="block text-muted-foreground">Start Date</span>
                    <span>{new Date(campaignData.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="block text-muted-foreground">End Date</span>
                    <span>{new Date(campaignData.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm">
                    <span className="block text-muted-foreground">Referrer</span>
                    <span>{campaignData.referrerName}</span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-4">Available Tasks</h3>
              <TaskList 
                tasks={campaignData.tasks} 
                campaignId={campaignData.id} 
                isReferrer={false} 
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-medium">Choose a Task</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Select any of the available tasks from the list that you'd like to complete.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-medium">Complete the Task</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Follow the instructions provided and use the assistant if you need help.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-medium">Verify Completion</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submit your task completion details for verification.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  4
                </div>
                <div>
                  <h4 className="text-sm font-medium">Help Your Friend</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your friend will receive their reward once you complete the task.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 