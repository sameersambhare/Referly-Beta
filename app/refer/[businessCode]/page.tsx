"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/app/components/ui/card"
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form"

// Define form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function ReferralLandingPage({ 
  params 
}: { 
  params: { businessCode: string } 
}) {
  const router = useRouter()
  const { businessCode } = params
  const [businessName, setBusinessName] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  const [referralLink, setReferralLink] = useState<string>("")
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })
  
  // Track click when page loads
  useEffect(() => {
    const trackClick = async () => {
      try {
        const response = await fetch("/api/referrals/track-click", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            businessCode,
          }),
        })
        
        if (!response.ok) {
          throw new Error("Failed to track click")
        }
        
        const data = await response.json()
        setBusinessName(data.businessName)
      } catch (error) {
        console.error("Error tracking click:", error)
        setError("Invalid referral link")
      } finally {
        setIsLoading(false)
      }
    }
    
    trackClick()
  }, [businessCode])
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setFormSubmitting(true)
    setError(null)
    
    try {
      // Generate a referral link for this person
      const generateResponse = await fetch("/api/referrals/generate-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          businessReferralCode: businessCode,
        }),
      })
      
      if (!generateResponse.ok) {
        throw new Error("Failed to generate referral link")
      }
      
      const generateData = await generateResponse.json()
      setReferralLink(generateData.referralLink)
      setSuccess(true)
    } catch (error) {
      setError("Error generating your referral link. Please try again.")
      console.error(error)
    } finally {
      setFormSubmitting(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Loading...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/")}>
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  if (success) {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Success!</CardTitle>
            <CardDescription className="text-center">
              Your referral link has been created
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center">
              Share this link with others to earn rewards when they sign up:
            </p>
            <div className="flex items-center space-x-2">
              <Input value={referralLink} readOnly className="flex-1" />
              <Button onClick={() => {
                navigator.clipboard.writeText(referralLink)
              }}>
                Copy
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button variant="outline" onClick={() => {
                const subject = encodeURIComponent("Check out this referral opportunity")
                const body = encodeURIComponent(`Hi,\n\nI wanted to share this referral link with you: ${referralLink}\n\nThanks!`)
                window.open(`mailto:?subject=${subject}&body=${body}`)
              }} className="flex-1">
                Share via Email
              </Button>
              <Button variant="outline" onClick={() => {
                const body = encodeURIComponent(`Check out this referral opportunity: ${referralLink}`)
                window.open(`sms:?body=${body}`)
              }} className="flex-1">
                Share via SMS
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Join {businessName}'s Referral Program
          </CardTitle>
          <CardDescription className="text-center">
            Enter your information to get your personalized referral link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form form={form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...form.register("name")}
                    disabled={formSubmitting}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.name?.message}</FormMessage>
              </FormItem>
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    {...form.register("email")}
                    disabled={formSubmitting}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.email?.message}</FormMessage>
              </FormItem>
              <FormItem>
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+1 (555) 123-4567"
                    {...form.register("phone")}
                    disabled={formSubmitting}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.phone?.message}</FormMessage>
              </FormItem>
              <Button type="submit" className="w-full" disabled={formSubmitting}>
                {formSubmitting ? "Creating your link..." : "Get Your Referral Link"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground text-center">
            By submitting, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 