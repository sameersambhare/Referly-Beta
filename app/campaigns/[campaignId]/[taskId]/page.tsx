"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"

interface TaskPageProps {
  params: {
    campaignId: string
    taskId: string
  }
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function TaskPage({ params }: TaskPageProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [taskData, setTaskData] = useState({
    id: "",
    title: "",
    description: "",
    businessName: "",
    campaignTitle: "",
    rewardType: "",
    rewardValue: "",
  })
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
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
          description: "Create an account and confirm your email address to get started with our service. This will help your friend earn rewards and you'll get access to exclusive offers.",
          businessName: "Acme Corporation",
          campaignTitle: "Summer Referral Program",
          rewardType: "discount",
          rewardValue: "25%",
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
  
  const onSubmit = async (data: FormValues) => {
    try {
      setSubmitting(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // In a real app, you would submit the form data to your API
      console.log("Form submitted:", data)
      
      // Redirect to success page
      router.push(`/campaigns/${params.campaignId}/${params.taskId}/success`)
    } catch (err) {
      console.error("Error submitting form:", err)
      setError("Failed to submit form. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }
  
  if (loading) {
    return (
      <div className="container py-10">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-64 bg-muted rounded"></div>
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
          <Link href={`/campaigns/${params.campaignId}`}>
            <Button>Back to Campaign</Button>
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Link href={`/campaigns/${params.campaignId}`} className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{taskData.businessName}</h1>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{taskData.title}</CardTitle>
            <CardDescription>{taskData.campaignTitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{taskData.description}</p>
            <div className="bg-muted p-4 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="font-medium">Reward</span>
              </div>
              <p className="text-sm">
                Complete this task to help your friend earn a {taskData.rewardValue} {taskData.rewardType}.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Complete Task</CardTitle>
            <CardDescription>
              Fill out this form to verify you've completed the task
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information you'd like to share..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Verification"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 