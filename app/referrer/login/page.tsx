import { Metadata } from "next"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/app/components/ui/button"
import { UserAuthForm } from "@/components/referrer/user-auth-form"
import { Icons } from "@/components/icons"

export const metadata: Metadata = {
  title: "Referrer Login | Referly",
  description: "Login to your referrer account to start sharing campaigns and earning rewards",
}

export default function ReferrerLoginPage() {
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
            <h1 className="text-4xl font-bold">Earn Rewards</h1>
            <p className="text-xl">
              Share products you love and earn rewards for every successful referral
            </p>
          </div>
          
          <div className="mt-8 bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <blockquote className="space-y-2">
              <p className="text-lg">
                "I've earned over $5,000 in the past year just by sharing products I already use and love with my friends and family."
              </p>
              <footer className="text-sm">
                <div className="flex items-center mt-4">
                  <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3 bg-primary-foreground">
                    <div className="absolute inset-0 flex items-center justify-center text-primary font-bold">
                      SJ
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-xs opacity-80">Top Referrer, 250+ successful referrals</p>
                  </div>
                </div>
              </footer>
            </blockquote>
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
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your referrer account to access your campaigns and rewards
            </p>
          </div>
          
          <UserAuthForm />
          
          <p className="px-8 text-center text-sm text-muted-foreground">
            By signing in, you agree to our{" "}
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
        </div>
      </div>
    </div>
  )
} 