"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
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
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function ReferralSubmissionPage({ 
  params 
}: { 
  params: { businessCode: string; referrerCode: string } 
}) {
  const router = useRouter()
  const { businessCode, referrerCode } = params
  const [businessName, setBusinessName] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false)
  const [success, setSuccess] = useState<boolean>(false)
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
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
            referrerCode,
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
  }, [businessCode, referrerCode])
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setFormSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch("/api/referrals/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessCode,
          referrerCode,
          name: data.name,
          email: data.email,
          phone: data.phone,
          notes: data.notes,
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit referral")
      }
      
      setSuccess(true)
    } catch (error: any) {
      setError(error.message || "Error submitting your information. Please try again.")
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
            <CardTitle className="text-2xl font-bold text-center">Thank You!</CardTitle>
            <CardDescription className="text-center">
              Your referral has been submitted successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              {businessName} will be in touch with you soon.
            </p>
            <p className="text-sm text-muted-foreground">
              Want to refer others and earn rewards too?
            </p>
            <Button 
              onClick={() => router.push(`/refer/${businessCode}`)}
              className="mt-4"
            >
              Get Your Own Referral Link
            </Button>
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
            You've been referred to {businessName}
          </CardTitle>
          <CardDescription className="text-center">
            Please fill out the form below to complete the referral
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
              <FormItem>
                <FormLabel>Notes (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional information you'd like to share"
                    {...form.register("notes")}
                    disabled={formSubmitting}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.notes?.message}</FormMessage>
              </FormItem>
              <Button type="submit" className="w-full" disabled={formSubmitting}>
                {formSubmitting ? "Submitting..." : "Submit Referral"}
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