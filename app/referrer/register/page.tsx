import { Metadata } from "next"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/app/components/ui/button"
import { Icons } from "@/components/icons"
import { ReferrerRegisterForm } from "@/components/referrer/register-form"

export const metadata: Metadata = {
  title: "Create Account | Referly",
  description: "Create a referrer account to start sharing campaigns and earning rewards",
}

export default function ReferrerRegisterPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        href="/auth/select-role"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "absolute left-4 top-4 md:left-8 md:top-8 flex items-center"
        )}
      >
        <Icons.chevronLeft className="mr-2 h-4 w-4" />
        Back
      </Link>
      
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-b from-primary to-primary-foreground" />
        <div className="relative z-20 flex flex-col justify-center h-full">
          <div className="flex flex-col space-y-4">
            <h1 className="text-4xl font-bold">Start Earning Today</h1>
            <p className="text-xl">
              Join thousands of referrers who are earning rewards by sharing products they love
            </p>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm flex items-start">
              <div className="mr-4 mt-1 bg-primary-foreground rounded-full p-1">
                <Icons.check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">No upfront costs</h3>
                <p className="text-sm opacity-80">It's completely free to join and start referring</p>
              </div>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm flex items-start">
              <div className="mr-4 mt-1 bg-primary-foreground rounded-full p-1">
                <Icons.check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Easy sharing</h3>
                <p className="text-sm opacity-80">Share via email, social media, or custom referral links</p>
              </div>
            </div>
            
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm flex items-start">
              <div className="mr-4 mt-1 bg-primary-foreground rounded-full p-1">
                <Icons.check className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Get paid quickly</h3>
                <p className="text-sm opacity-80">Receive rewards directly to your account</p>
              </div>
            </div>
          </div>
          
          <div className="mt-auto flex items-center space-x-4">
            <div className="flex -space-x-2">
              <div className="h-8 w-8 rounded-full border-2 border-background bg-primary-foreground flex items-center justify-center text-xs font-bold">JD</div>
              <div className="h-8 w-8 rounded-full border-2 border-background bg-primary-foreground flex items-center justify-center text-xs font-bold">TM</div>
              <div className="h-8 w-8 rounded-full border-2 border-background bg-primary-foreground flex items-center justify-center text-xs font-bold">RK</div>
            </div>
            <p className="text-sm">Join 10,000+ referrers already earning rewards</p>
          </div>
        </div>
      </div>
      
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Enter your details below to create your referrer account
            </p>
          </div>
          
          <ReferrerRegisterForm />
          
          <p className="px-8 text-center text-sm text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
          </p>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>
          
          <Link 
            href="/referrer/login" 
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "w-full font-semibold"
            )}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
} 