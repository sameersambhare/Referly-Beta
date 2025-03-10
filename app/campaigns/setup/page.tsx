"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { CampaignAIAssistant } from "@/app/components/dashboard/CampaignAIAssistant"
import { TaskManager } from "@/app/components/dashboard/TaskManager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { ArrowLeft, Sparkles, Zap } from "lucide-react"
import Link from "next/link"

export default function CampaignSetupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [campaignId, setCampaignId] = useState<string>("campaign-001") // In a real app, this would be generated or fetched
  const [businessName, setBusinessName] = useState<string>("Acme Corporation") // In a real app, this would be fetched from user profile
  
  const handleCreateCampaign = (campaignData: any) => {
    // In a real app, this would create a campaign via API
    console.log("Creating campaign:", campaignData)
    // And then set the campaign ID
    setCampaignId("campaign-" + Date.now())
  }
  
  const handleCreateTask = (taskData: any) => {
    // In a real app, this would create a task via API
    console.log("Creating task:", taskData)
  }
  
  if (status === "loading") {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }
  
  if (status !== "authenticated") {
    router.push("/auth/login")
    return null
  }
  
  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Link href="/campaigns" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Campaign Setup</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                AI-Powered Campaign Setup
              </CardTitle>
              <CardDescription>
                Our AI assistant will help you create the perfect referral campaign for your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                <CampaignAIAssistant 
                  businessName={businessName}
                  userName={session?.user?.name || "there"}
                  onCreateCampaign={handleCreateCampaign}
                  onCreateTask={handleCreateTask}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-primary" />
                Zapier Integration
              </CardTitle>
              <CardDescription>
                Connect your user database to automatically generate referral links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Integrate with your existing tools to automate your referral program:
                </p>
                <ul className="list-disc pl-5 text-sm space-y-2">
                  <li>Import customers from your CRM</li>
                  <li>Send automated emails with referral links</li>
                  <li>Track conversions in your analytics platform</li>
                  <li>Process rewards through your payment system</li>
                </ul>
                <Button className="w-full mt-4">
                  Connect with Zapier
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Campaign Tasks</CardTitle>
              <CardDescription>
                Define what referred users need to do to trigger rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskManager campaignId={campaignId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 