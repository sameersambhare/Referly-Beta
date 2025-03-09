"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"

export default function GenerateReferralLinkPage() {
  const { data: session, status } = useSession()
  const [referralLink, setReferralLink] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)
  
  const generateLink = async () => {
    setIsLoading(true)
    setError(null)
    setCopied(false)
    
    try {
      const response = await fetch("/api/referrals/generate-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })
      
      if (!response.ok) {
        throw new Error("Failed to generate referral link")
      }
      
      const data = await response.json()
      setReferralLink(data.referralLink)
    } catch (error) {
      setError("Error generating referral link. Please try again.")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const shareViaEmail = () => {
    const subject = encodeURIComponent("Check out this referral opportunity")
    const body = encodeURIComponent(`Hi,\n\nI wanted to share this referral link with you: ${referralLink}\n\nThanks!`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }
  
  const shareViaSMS = () => {
    const body = encodeURIComponent(`Check out this referral opportunity: ${referralLink}`)
    window.open(`sms:?body=${body}`)
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Generate Referral Link</h1>
      
      <Tabs defaultValue="business">
        <TabsList className="mb-4">
          <TabsTrigger value="business">Business Link</TabsTrigger>
          <TabsTrigger value="custom">Custom Referrer Link</TabsTrigger>
        </TabsList>
        
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Your Business Referral Link</CardTitle>
              <CardDescription>
                Share this link with potential referrers who can then create their own personalized referral links.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              
              {referralLink ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input value={referralLink} readOnly className="flex-1" />
                    <Button onClick={copyToClipboard}>
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={shareViaEmail} className="flex-1">
                      Share via Email
                    </Button>
                    <Button variant="outline" onClick={shareViaSMS} className="flex-1">
                      Share via SMS
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Generate your business referral link to share with potential referrers.
                  </p>
                  <Button onClick={generateLink} disabled={isLoading}>
                    {isLoading ? "Generating..." : "Generate Link"}
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-muted-foreground">
                This link is unique to your business.
              </p>
              {referralLink && (
                <Button variant="ghost" onClick={() => setReferralLink("")}>
                  Reset
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Referrer Link</CardTitle>
              <CardDescription>
                Create a personalized referral link for a specific referrer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This feature will be available soon. It will allow you to create custom referral links for specific referrers.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 