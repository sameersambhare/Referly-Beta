"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { ArrowRight, Gift, Users, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ReferralLandingPage() {
  const router = useRouter()
  const [referralCode, setReferralCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!referralCode.trim()) {
      setError("Please enter a referral code")
      return
    }
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      // In a real app, this would validate the referral code with an API
      // For demo purposes, we'll just redirect to a mock campaign
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Redirect to the campaign page
      router.push(`/refer/campaign123`)
    } catch (err) {
      setError("Invalid referral code. Please try again.")
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Referly</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Complete tasks, help your friends earn rewards, and join our referral program to start earning yourself.
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Enter Your Referral Code</CardTitle>
              <CardDescription>
                If you were referred by a friend, enter their code to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="referral-code">Referral Code</Label>
                    <Input
                      id="referral-code"
                      placeholder="Enter code (e.g. FRIEND25)"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Checking..." : "Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground">
              <p>No code? <Link href="/" className="text-primary hover:underline">Visit our homepage</Link></p>
              <p><Link href="/dashboard" className="text-primary hover:underline">Business login</Link></p>
            </CardFooter>
          </Card>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">How It Works</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Help Your Friends</h3>
                  <p className="text-muted-foreground">
                    When you complete tasks using a friend's referral code, they earn rewards.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Complete Simple Tasks</h3>
                  <p className="text-muted-foreground">
                    Tasks are quick and easy to complete, with clear instructions and assistance.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                  <Gift className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Earn Rewards Yourself</h3>
                  <p className="text-muted-foreground">
                    After completing a task, you can join the referral program and start earning rewards too.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-muted rounded-lg p-6 md:p-8">
          <div className="grid gap-6 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Are You a Business?</h2>
              <p className="text-muted-foreground mb-4">
                Create your own referral program and grow your customer base through word-of-mouth marketing.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Increase customer acquisition</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Reward loyal customers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Track referral performance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span>Customize rewards and tasks</span>
                </li>
              </ul>
              <Button asChild>
                <Link href="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="hidden md:block bg-primary/5 rounded-lg p-6 border border-primary/10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 mb-4">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Referly for Business</h3>
                <p className="text-muted-foreground mb-4">
                  Our platform makes it easy to create, manage, and track referral campaigns.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Features include:</p>
                  <p>Campaign management, analytics dashboard, customizable rewards, AI assistant, and more.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 