"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import { AlertCircle } from "lucide-react"
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"

// Define form schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  rewardType: z.enum(['cash', 'discount', 'gift', 'points']),
  rewardAmount: z.coerce.number().min(0, "Reward amount must be a positive number"),
  rewardDescription: z.string().optional(),
  targetAudience: z.string().optional(),
  conversionCriteria: z.string().optional(),
  landingPageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  customMessage: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function NewCampaignPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Initialize form with today's date as default start date
  const today = new Date().toISOString().split('T')[0]
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: today,
      endDate: "",
      rewardType: "cash",
      rewardAmount: 0,
      rewardDescription: "",
      targetAudience: "",
      conversionCriteria: "",
      landingPageUrl: "",
      customMessage: "",
    },
  })
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Include the businessId from the session if available
      const payload = {
        ...data,
        businessId: session?.user?.id || "demo-business"
      };
      
      console.log("Submitting campaign data:", payload);
      
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        setError(result.error || "Failed to create campaign")
        setIsLoading(false)
        return
      }
      
      console.log("Campaign created successfully:", result);
      router.push("/campaigns")
    } catch (error) {
      setError("An error occurred. Please try again.")
      console.error(error)
      setIsLoading(false)
    }
  }
  
  // Handle form errors
  const onError = (errors: any) => {
    console.log(errors);
    const requiredFields = [];
    if (errors.name) requiredFields.push("Campaign Name");
    if (errors.startDate) requiredFields.push("Start Date");
    if (errors.rewardType) requiredFields.push("Reward Type");
    if (errors.rewardAmount) requiredFields.push("Reward Amount");
    
    if (requiredFields.length > 0) {
      setError(`Please fill in all required fields: ${requiredFields.join(", ")}`);
    }
    setIsLoading(false);
  }
  
  if (status === "loading") {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Create Campaign</h1>
        <div className="h-96 rounded-lg bg-muted animate-pulse" />
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Create Campaign</h1>
        <Link href="/campaigns">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Create a new referral campaign to start generating leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/15 p-4 text-destructive flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                {error.includes("required fields") && (
                  <p className="text-sm mt-1">Please check the fields marked with an asterisk (*) and highlighted in red.</p>
                )}
              </div>
            </div>
          )}
          
          <Form form={form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-6">
              <p className="text-sm text-muted-foreground mb-4">Fields marked with an asterisk (*) are required.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormItem className={form.formState.errors.name ? "border-l-2 border-destructive pl-3" : ""}>
                  <FormLabel className={form.formState.errors.name ? "text-destructive" : ""}>Campaign Name*</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Summer Referral Program"
                      {...form.register("name")}
                      disabled={isLoading}
                      className={form.formState.errors.name ? "border-destructive" : ""}
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.name?.message}</FormMessage>
                </FormItem>
                
                <FormItem className={form.formState.errors.startDate ? "border-l-2 border-destructive pl-3" : ""}>
                  <FormLabel className={form.formState.errors.startDate ? "text-destructive" : ""}>Start Date*</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...form.register("startDate")}
                      disabled={isLoading}
                      className={form.formState.errors.startDate ? "border-destructive" : ""}
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.startDate?.message}</FormMessage>
                </FormItem>
                
                <FormItem>
                  <FormLabel>End Date (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...form.register("endDate")}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.endDate?.message}</FormMessage>
                </FormItem>
                
                <FormItem>
                  <FormLabel>Landing Page URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/landing-page"
                      {...form.register("landingPageUrl")}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.landingPageUrl?.message}</FormMessage>
                </FormItem>
                
                <FormItem className="md:col-span-2">
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your campaign"
                      {...form.register("description")}
                      disabled={isLoading}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage>{form.formState.errors.description?.message}</FormMessage>
                </FormItem>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Reward Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormItem className={form.formState.errors.rewardType ? "border-l-2 border-destructive pl-3" : ""}>
                    <FormLabel className={form.formState.errors.rewardType ? "text-destructive" : ""}>Reward Type*</FormLabel>
                    <Select
                      defaultValue={form.getValues("rewardType")}
                      onValueChange={(value) => form.setValue("rewardType", value as any)}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className={form.formState.errors.rewardType ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select reward type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="discount">Discount</SelectItem>
                        <SelectItem value="gift">Gift</SelectItem>
                        <SelectItem value="points">Points</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage>{form.formState.errors.rewardType?.message}</FormMessage>
                  </FormItem>
                  
                  <FormItem className={form.formState.errors.rewardAmount ? "border-l-2 border-destructive pl-3" : ""}>
                    <FormLabel className={form.formState.errors.rewardAmount ? "text-destructive" : ""}>Reward Amount*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="50"
                        {...form.register("rewardAmount", { valueAsNumber: true })}
                        disabled={isLoading}
                        className={form.formState.errors.rewardAmount ? "border-destructive" : ""}
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.rewardAmount?.message}</FormMessage>
                  </FormItem>
                  
                  <FormItem className="md:col-span-2">
                    <FormLabel>Reward Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the reward in detail"
                        {...form.register("rewardDescription")}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.rewardDescription?.message}</FormMessage>
                  </FormItem>
                </div>
              </div>
              
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormItem>
                    <FormLabel>Target Audience (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Existing customers, new leads, etc."
                        {...form.register("targetAudience")}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.targetAudience?.message}</FormMessage>
                  </FormItem>
                  
                  <FormItem>
                    <FormLabel>Conversion Criteria (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Purchase, sign up, etc."
                        {...form.register("conversionCriteria")}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.conversionCriteria?.message}</FormMessage>
                  </FormItem>
                  
                  <FormItem className="md:col-span-2">
                    <FormLabel>Custom Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Custom message for referrers"
                        {...form.register("customMessage")}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage>{form.formState.errors.customMessage?.message}</FormMessage>
                  </FormItem>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Link href="/campaigns">
                  <Button variant="outline" type="button" disabled={isLoading}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create Campaign"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 