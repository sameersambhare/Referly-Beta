"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Textarea } from "@/app/components/ui/textarea"
import { DatePicker } from "@/app/components/ui/date-picker"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

export default function CustomRewardPage() {
  const { data: session, status } = useSession()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [code, setCode] = useState("")
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  )
  const [saving, setSaving] = useState(false)

  const handleCreateReward = async () => {
    if (!title || !description || !code) {
      return
    }
    
    setSaving(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real application, you would save the custom reward to the backend
    // const response = await fetch("/api/rewards/custom", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     title,
    //     description,
    //     code,
    //     expiryDate,
    //   }),
    // })
    
    setSaving(false)
    
    // Reset form
    setTitle("")
    setDescription("")
    setCode("")
    setExpiryDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  }

  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Link href="/rewards" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Create Custom Reward</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Custom Reward Details</CardTitle>
          <CardDescription>
            Create a custom reward to offer your referrers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Reward Title</Label>
            <Input 
              id="title" 
              placeholder="e.g. 20% Off Your Next Purchase" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe the reward and any conditions" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">Reward Code</Label>
            <Input 
              id="code" 
              placeholder="e.g. REFERRAL20" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <DatePicker
              id="expiryDate"
              date={expiryDate}
              setDate={setExpiryDate}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/rewards">Cancel</Link>
          </Button>
          <Button 
            onClick={handleCreateReward} 
            disabled={saving || !title || !description || !code}
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Reward
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
} 