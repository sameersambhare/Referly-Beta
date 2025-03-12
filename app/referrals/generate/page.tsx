"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../../components/ui/card"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { Button } from "../../components/ui/button"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { Textarea } from "../../components/ui/textarea"
import { Icons } from "../../components/icons"
import { Clipboard, Check, AlertCircle } from "lucide-react"

// Form schema
const formSchema = z.object({
  campaignId: z.string().min(1, "Please select a campaign"),
  customMessage: z.string().optional(),
})

type Campaign = {
  _id: string
  name: string
  description: string
  companyName?: string
}

// Custom Alert component
interface AlertProps {
  variant?: "default" | "destructive"
  className?: string
  children: React.ReactNode
}

function Alert({ variant = "default", className = "", children }: AlertProps) {
  return (
    <div className={`p-4 rounded-md ${variant === "destructive" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"} ${className}`}>
      {children}
    </div>
  )
}

function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm">{children}</div>
}

export default function GenerateReferralLinkPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Get campaignId from URL if present
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const campaignIdFromUrl = searchParams.get('campaignId')

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaignId: campaignIdFromUrl || "",
      customMessage: "",
    },
  })

  // Fetch campaigns on component mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/referrer/campaigns?selected=true")
        
        if (!response.ok) {
          throw new Error("Failed to fetch campaigns")
        }
        
        const data = await response.json()
        setCampaigns(data)
        
        // If we have a campaignId from URL and it's in the list of campaigns, select it
        if (campaignIdFromUrl) {
          const campaignExists = data.some((campaign: Campaign) => campaign._id === campaignIdFromUrl)
          if (campaignExists) {
            form.setValue('campaignId', campaignIdFromUrl)
          }
        }
      } catch (err) {
        console.error("Error fetching campaigns:", err)
        setError("Failed to load campaigns. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCampaigns()
  }, [campaignIdFromUrl, form])

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setGeneratedLink(null)
    
    try {
      const response = await fetch("/api/referrals/generate-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        setError(data.error || "Failed to generate referral link")
        console.error("Error generating link:", data.error)
        return
      }
      
      setGeneratedLink(data.referralLink)
      setSuccess("Referral link generated successfully!")
      
    } catch (err) {
      console.error("Error generating referral link:", err)
      setError("Failed to generate the referral link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Copy link to clipboard
  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Generate Referral Link</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create New Referral Link</CardTitle>
            <CardDescription>
              Generate a unique referral link to share with potential customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && !generatedLink && (
              <Alert className="mb-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="campaignId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Campaign</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoading || campaigns.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a campaign" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {campaigns.map((campaign) => (
                            <SelectItem key={campaign._id} value={campaign._id}>
                              {campaign.name} {campaign.companyName ? `(${campaign.companyName})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Message (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add a personal message to include with your referral" 
                          disabled={isLoading} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Link"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {generatedLink && (
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
              <CardDescription>
                Share this link with potential customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted rounded-md flex items-center justify-between">
                <div className="truncate mr-2">
                  <code className="text-sm">{generatedLink}</code>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={copyToClipboard}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>This link is unique to you and the selected campaign. When someone uses this link, you'll receive credit for the referral.</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    window.open(`mailto:?subject=Check out this offer&body=I thought you might be interested in this: ${generatedLink}`, '_blank')
                  }}
                >
                  Share via Email
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    window.open(`https://wa.me/?text=Check out this offer: ${generatedLink}`, '_blank')
                  }}
                >
                  Share via WhatsApp
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  )
} 