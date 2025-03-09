"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
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
  password: z.string().min(8, "Password must be at least 8 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  industry: z.string().optional(),
  phone: z.string().optional(),
  referralCode: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      businessName: "",
      industry: "",
      phone: "",
      referralCode: "",
    },
  })
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          role: "business",
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        setError(result.error || "Registration failed. Please try again.")
        setIsLoading(false)
        return
      }
      
      // Sign in the user after successful registration
      await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      })
      
      router.push("/dashboard")
    } catch (error) {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your information to create a business account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <Form form={form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    {...form.register("name")}
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.email?.message}</FormMessage>
              </FormItem>
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...form.register("password")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.password?.message}</FormMessage>
              </FormItem>
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Acme Inc."
                    {...form.register("businessName")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.businessName?.message}</FormMessage>
              </FormItem>
              <FormItem>
                <FormLabel>Industry</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Technology, Retail, etc."
                    {...form.register("industry")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.industry?.message}</FormMessage>
              </FormItem>
              <FormItem>
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+1 (555) 123-4567"
                    {...form.register("phone")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.phone?.message}</FormMessage>
              </FormItem>
              <FormItem>
                <FormLabel>Referral Code (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter referral code if you have one"
                    {...form.register("referralCode")}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.referralCode?.message}</FormMessage>
              </FormItem>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
} 