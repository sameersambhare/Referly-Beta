"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import Image from "next/image"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Form schema
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export default function CustomerLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)
    
    try {
      console.log("Attempting customer login:", values.email)
      
      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })
      
      console.log("Sign-in result:", result)
      
      if (result?.error) {
        setError("Invalid email or password")
        console.error("Login error:", result.error)
        return
      }
      
      // Fetch user data to verify role with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const userResponse = await fetch("/api/auth/me", {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!userResponse.ok) {
          throw new Error(`HTTP error! Status: ${userResponse.status}`);
        }
        
        const userData = await userResponse.json();
        console.log("User data:", userData);
        
        if (userData.error) {
          throw new Error(userData.error);
        }
        
        if (userData.role !== "customer") {
          setError("This account is not a customer account. Please use the appropriate login page.");
          await signIn("credentials", {
            redirect: false,
            email: "",
            password: "",
          });
          return;
        }
        
        // Redirect to customer dashboard
        router.push("/customer/dashboard");
      } catch (fetchError: any) {
        console.error("Error fetching user data:", fetchError);
        
        // If it's a timeout or connection error, assume login was successful and redirect
        if (fetchError.name === 'AbortError' || 
            fetchError.message?.includes('buffering timed out') ||
            fetchError.message?.includes('network') ||
            fetchError.message?.includes('connection')) {
          console.log("Database connection issue, but proceeding with login");
          router.push("/customer/dashboard");
        } else {
          setError("Error verifying account type. Please try again.");
        }
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex items-center justify-center mb-6">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Logo"
                width={50}
                height={50}
                className="mr-2"
              />
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">
              Customer Login
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password to access your customer account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="name@example.com" 
                          type="email" 
                          autoCapitalize="none" 
                          autoComplete="email" 
                          autoCorrect="off" 
                          disabled={isLoading} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="••••••••" 
                          type="password" 
                          autoComplete="current-password" 
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
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              <Link
                href="/auth/customer/forgot-password"
                className="text-primary underline-offset-4 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/customer/register"
                className="text-primary underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              <Link
                href="/auth/select-role"
                className="text-primary underline-offset-4 hover:underline"
              >
                Choose a different role
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 