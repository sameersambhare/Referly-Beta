"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Switch } from "@/app/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function RewardSettingsPage() {
  const { data: session, status } = useSession()
  const [autoRewards, setAutoRewards] = useState(false)
  const [rewardThreshold, setRewardThreshold] = useState("3")
  const [defaultRewardType, setDefaultRewardType] = useState("coupon")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [saving, setSaving] = useState(false)

  const handleSaveSettings = async () => {
    setSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real application, you would save the settings to the backend
    // const response = await fetch("/api/rewards/settings", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     autoRewards,
    //     rewardThreshold,
    //     defaultRewardType,
    //     emailNotifications,
    //   }),
    // })
    
    setSaving(false)
  }

  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Link href="/rewards" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Reward Settings</h1>
      </div>
      
      <Tabs defaultValue="general" className="mb-8">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Reward Settings</CardTitle>
              <CardDescription>
                Configure your default reward settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultRewardType">Default Reward Type</Label>
                <Select 
                  value={defaultRewardType} 
                  onValueChange={setDefaultRewardType}
                >
                  <SelectTrigger id="defaultRewardType">
                    <SelectValue placeholder="Select reward type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coupon">Coupon</SelectItem>
                    <SelectItem value="discount">Discount Code</SelectItem>
                    <SelectItem value="gift">Gift Card</SelectItem>
                    <SelectItem value="custom">Custom Reward</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rewardThreshold">Reward Threshold (Conversions)</Label>
                <Select 
                  value={rewardThreshold} 
                  onValueChange={setRewardThreshold}
                >
                  <SelectTrigger id="rewardThreshold">
                    <SelectValue placeholder="Select threshold" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Conversion</SelectItem>
                    <SelectItem value="2">2 Conversions</SelectItem>
                    <SelectItem value="3">3 Conversions</SelectItem>
                    <SelectItem value="5">5 Conversions</SelectItem>
                    <SelectItem value="10">10 Conversions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoRewards">Automatic Rewards</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically send rewards when threshold is reached
                  </p>
                </div>
                <Switch
                  id="autoRewards"
                  checked={autoRewards}
                  onCheckedChange={setAutoRewards}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="automation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>
                Configure how rewards are automatically processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoRewards">Automatic Rewards</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically send rewards when threshold is reached
                  </p>
                </div>
                <Switch
                  id="autoRewards"
                  checked={autoRewards}
                  onCheckedChange={setAutoRewards}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rewardSchedule">Reward Schedule</Label>
                <Select defaultValue="immediate">
                  <SelectTrigger id="rewardSchedule">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="daily">Daily (Batch)</SelectItem>
                    <SelectItem value="weekly">Weekly (Batch)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you and your referrers are notified about rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications when rewards are issued
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailTemplate">Email Template</Label>
                <Select defaultValue="default">
                  <SelectTrigger id="emailTemplate">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Template</SelectItem>
                    <SelectItem value="minimal">Minimal Template</SelectItem>
                    <SelectItem value="branded">Branded Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="adminEmail">Admin Notification Email</Label>
                <Input 
                  id="adminEmail" 
                  type="email" 
                  placeholder="admin@yourcompany.com" 
                  defaultValue={session?.user?.email || ""}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 