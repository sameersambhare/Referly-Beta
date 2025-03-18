import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card"
import { Icons } from "../../components/icons"
import { User, Building, ShoppingBag } from "lucide-react"

export const metadata: Metadata = {
  title: "Select Role - Referly",
  description: "Choose how you want to use Referly",
}

export default function SelectRolePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl w-full">
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 mb-4">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Icons.logo className="h-8 w-8 text-primary" aria-hidden="true" />
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                Referly
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Choose how you want to use Referly and start your journey
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
            {/* Business Card */}
            <Link href="/auth/business/login" className="group">
              <Card className="h-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:bg-accent/5 border-2 group-hover:border-primary/20">
                <CardHeader className="space-y-2">
                  <CardTitle className="flex items-center text-2xl group-hover:text-primary transition-colors">
                    <Building className="w-6 h-6 mr-3 group-hover:text-primary transition-colors" />
                    Business
                  </CardTitle>
                  <CardDescription className="text-base">
                    Create and manage referral campaigns for your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                      Create referral campaigns
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                      Track referral performance
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                      Manage rewards and payouts
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                      Access analytics and insights
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Link>

            {/* Referrer Card */}
            <Link href="/referrer/login" className="group">
              <Card className="h-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:bg-accent/5 border-2 group-hover:border-primary/20">
                <CardHeader className="space-y-2">
                  <CardTitle className="flex items-center text-2xl group-hover:text-primary transition-colors">
                    <User className="w-6 h-6 mr-3 group-hover:text-primary transition-colors" />
                    Referrer
                  </CardTitle>
                  <CardDescription className="text-base">
                    Share campaigns and earn rewards as a referrer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                      Browse available campaigns
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                      Share with your network
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                      Track your referrals
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                      Earn rewards
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Link>

            {/* Customer Card */}
            <Link href="/auth/customer/login" className="group">
              <Card className="h-full transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:bg-accent/5 border-2 group-hover:border-primary/20">
                <CardHeader className="space-y-2">
                  <CardTitle className="flex items-center text-2xl group-hover:text-primary transition-colors">
                    <ShoppingBag className="w-6 h-6 mr-3 group-hover:text-primary transition-colors" />
                    Customer
                  </CardTitle>
                  <CardDescription className="text-base">
                    Redeem referral links and earn rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                      Paste referral links
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                      View active campaigns
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                      Share campaigns with others
                    </li>
                    <li className="flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mr-2" />
                      Redeem rewards
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Footer Section */}
          <div className="text-center text-sm text-muted-foreground mt-12 max-w-2xl">
            <p className="leading-relaxed">
              By continuing, you agree to our{" "}
              <Link
                href="/terms"
                className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="font-medium underline underline-offset-4 hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 