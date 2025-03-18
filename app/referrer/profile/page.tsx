"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Separator } from "@/app/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  User, 
  Briefcase, 
  Mail, 
  Calendar, 
  Award, 
  Gift, 
  CreditCard, 
  TrendingUp,
  Edit,
  Check,
  Copy
} from "lucide-react"

// Types for referrer profile data
type ReferrerProfile = {
  _id: string
  name: string
  email: string
  role: string
  company: string
  businessId: string
  businessName?: string
  image?: string
  referralCode: string
  earnings: number
  metrics?: {
    totalReferrals: number
    successfulReferrals: number
    conversionRate: number
    totalEarnings: number
  }
  customerSince: string
  paymentInfo?: {
    paypalEmail?: string
    bankAccount?: {
      accountNumber: string
      routingNumber: string
      bankName: string
    }
  }
}

export default function ReferrerProfile() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ReferrerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Function to get user initials for avatar
  const getUserInitials = () => {
    if (!profile?.name) return "U"
    return profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // Copy referral code to clipboard
  const copyToClipboard = () => {
    if (!profile?.referralCode) return
    
    navigator.clipboard.writeText(profile.referralCode)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(err => {
        console.error("Failed to copy: ", err)
      })
  }

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!session?.user) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch profile data from API
        const response = await fetch("/api/referrer/profile")
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to load profile data")
        }
        
        const data = await response.json()
        setProfile(data.profile)
        
      } catch (err) {
        console.error("Error fetching profile:", err)
        setError(err instanceof Error ? err.message : "Failed to load profile data")
        
        // For demo purposes - fallback to mock data if API fails
        if (process.env.NODE_ENV === "development") {
          console.log("Falling back to mock data for development")
          
          const mockProfile: ReferrerProfile = {
            _id: session.user.id,
            name: session.user.name ?? "Referrer User",
            email: session.user.email ?? "user@example.com",
            role: "referrer",
            company: "Demo Company",
            businessId: "business123",
            businessName: "Demo Business",
            image: undefined,
            referralCode: "REF" + Math.random().toString(36).substring(2, 8).toUpperCase(),
            earnings: 345.50,
            metrics: {
              totalReferrals: 24,
              successfulReferrals: 18,
              conversionRate: 75,
              totalEarnings: 345.50
            },
            customerSince: new Date().toISOString().split('T')[0],
            paymentInfo: {
              paypalEmail: session.user.email
            }
          }
          
          setProfile(mockProfile)
          setError(null)
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProfileData()
  }, [session])

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  if (isLoading) {
    return (
      <div className="container py-10 flex justify-center">
        <Icons.spinner className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-destructive">{error || "Could not load profile data"}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.image || ""} alt={profile.name} />
                <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{profile.name}</CardTitle>
            <Badge variant="outline" className="mx-auto mt-2">
              Referrer
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{profile.email}</span>
            </div>
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{profile.company}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Member since {formatDate(profile.customerSince)}</span>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Your Referral Code</p>
              <div className="bg-muted p-2 rounded-md text-center font-mono">
                {profile.referralCode}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-2"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metrics and Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center">
                  <TrendingUp className="h-8 w-8 mb-2 text-primary" />
                  <p className="text-2xl font-bold">{profile.metrics?.totalReferrals || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Referrals</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center">
                  <Award className="h-8 w-8 mb-2 text-primary" />
                  <p className="text-2xl font-bold">{profile.metrics?.successfulReferrals || 0}</p>
                  <p className="text-xs text-muted-foreground">Successful Referrals</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center">
                  <Gift className="h-8 w-8 mb-2 text-primary" />
                  <p className="text-2xl font-bold">{profile.metrics?.conversionRate || 0}%</p>
                  <p className="text-xs text-muted-foreground">Conversion Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center">
                  <CreditCard className="h-8 w-8 mb-2 text-primary" />
                  <p className="text-2xl font-bold">${profile.metrics?.totalEarnings.toFixed(2) || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Earnings</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for more details */}
          <Tabs defaultValue="payment">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="payment">Payment Info</TabsTrigger>
              <TabsTrigger value="business">Business Details</TabsTrigger>
            </TabsList>
            <TabsContent value="payment" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment Information</CardTitle>
                  <CardDescription>
                    How you'll receive your referral earnings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">PayPal Email</p>
                      <p className="text-sm">{profile.paymentInfo?.paypalEmail || "Not set"}</p>
                    </div>
                    {profile.paymentInfo?.bankAccount ? (
                      <div>
                        <p className="text-sm font-medium mb-1">Bank Account</p>
                        <p className="text-sm">{profile.paymentInfo.bankAccount.bankName}</p>
                        <p className="text-sm">Account ending in {profile.paymentInfo.bankAccount.accountNumber.slice(-4)}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium mb-1">Bank Account</p>
                        <p className="text-sm">No bank account information added</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Payment Info
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="business" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Information</CardTitle>
                  <CardDescription>
                    Details about the business you're referring for
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Business Name</p>
                      <p className="text-sm">{profile.businessName || "Not available"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Your Company</p>
                      <p className="text-sm">{profile.company}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Customer Since</p>
                      <p className="text-sm">{formatDate(profile.customerSince)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 