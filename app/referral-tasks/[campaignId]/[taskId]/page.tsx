"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ReferralChatbot } from "@/app/components/referral/ReferralChatbot"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Badge } from "@/app/components/ui/badge"
import { ArrowLeft, Gift, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"

interface TaskPageProps {
  params: {
    campaignId: string
    taskId: string
  }
}

export default function TaskPage({ params }: TaskPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [taskData, setTaskData] = useState({
    id: "",
    title: "",
    description: "",
    completionCriteria: "",
    rewardType: "discount" as "discount" | "payout",
    rewardValue: "",
    businessName: "",
    referrerName: ""
  })
  
  useEffect(() => {
    // In a real app, this would fetch the task data from the API
    const fetchTaskData = async () => {
      try {
        setLoading(true)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data for demonstration
        setTaskData({
          id: params.taskId,
          title: "Sign up for a free trial",
          description: "Complete the sign-up process for a 14-day free trial of our premium service.",
          completionCriteria: "Create an account and confirm your email address. Then explore at least one feature of the platform.",
          rewardType: "discount",
          rewardValue: "25%",
          businessName: "Acme Corporation",
          referrerName: "John Smith"
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
  
  const handleTaskComplete = async (data: any) => {
    try {
      // In a real app, this would submit to an API
      console.log("Task completion data:", data)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Navigate to success page
      router.push(`/referral-tasks/${params.campaignId}/${params.taskId}/success`)
    } catch (err) {
      console.error("Error submitting task completion:", err)
    }
  }
  
  if (loading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-muted rounded"></div>
            <div className="h-96 bg-muted rounded"></div>
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
          <p>Please check the task link and try again.</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Link href={`/referral-tasks/${params.campaignId}`} className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{taskData.businessName}</h1>
        <Badge className="ml-4 bg-primary">Referred by {taskData.referrerName}</Badge>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{taskData.title}</CardTitle>
                  <CardDescription>Complete this task to help {taskData.referrerName} earn rewards</CardDescription>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Task</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Task Description</h3>
                <p className="text-sm">{taskData.description}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Completion Criteria</h3>
                <p className="text-sm">{taskData.completionCriteria}</p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Gift className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">Reward Information</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      When you complete this task, {taskData.referrerName} will receive a {taskData.rewardType === 'discount' ? 'discount' : 'cash reward'} of {taskData.rewardValue}.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You'll also be eligible to join the referral program and earn rewards yourself!
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium">How to Complete</h4>
                    <ol className="text-xs text-muted-foreground mt-1 space-y-1 list-decimal pl-4">
                      <li>Follow the task instructions</li>
                      <li>Use the assistant to guide you through the process</li>
                      <li>Click "I've Completed the Task" when done</li>
                      <li>Fill in your details for verification</li>
                      <li>Submit your completion</li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:hidden">
            <CardHeader>
              <CardTitle>Task Assistant</CardTitle>
              <CardDescription>
                Get help completing your task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => document.getElementById('chatbot')?.scrollIntoView({ behavior: 'smooth' })}>
                Open Assistant
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div id="chatbot" className="h-[600px]">
          <ReferralChatbot 
            businessName={taskData.businessName}
            referrerName={taskData.referrerName}
            task={{
              id: taskData.id,
              title: taskData.title,
              description: taskData.description,
              completionCriteria: taskData.completionCriteria,
              rewardType: taskData.rewardType,
              rewardValue: taskData.rewardValue
            }}
            onTaskComplete={handleTaskComplete}
          />
        </div>
      </div>
    </div>
  )
} 