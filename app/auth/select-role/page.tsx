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
    <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:px-0">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <div className="flex flex-col space-y-2 text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/logo.png"
                alt="Logo"
                width={50}
                height={50}
                className="mr-2"
              />
              <h1 className="text-3xl font-bold">Referly</h1>
            </div>
            <p className="text-muted-foreground">
              Choose how you want to use Referly
            </p>
          </div>

          <div className="grid gap-4">
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <Link href="/auth/business/login">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Business
                  </CardTitle>
                  <CardDescription>
                    Create and manage referral campaigns for your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Create referral campaigns</li>
                    <li>Track referral performance</li>
                    <li>Manage rewards and payouts</li>
                    <li>Access analytics and insights</li>
                  </ul>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <Link href="/referrer/login">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Referrer
                  </CardTitle>
                  <CardDescription>
                    Share campaigns and earn rewards as a referrer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Browse available campaigns</li>
                    <li>Share with your network</li>
                    <li>Track your referrals</li>
                    <li>Earn rewards</li>
                  </ul>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <Link href="/auth/customer/login">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Customer
                  </CardTitle>
                  <CardDescription>
                    Redeem referral links and earn rewards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Paste referral links</li>
                    <li>View active campaigns</li>
                    <li>Share campaigns with others</li>
                    <li>Redeem rewards</li>
                  </ul>
                </CardContent>
              </Link>
            </Card>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              By continuing, you agree to our{" "}
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
    </div>
  )
} 