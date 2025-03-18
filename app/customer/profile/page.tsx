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
  Mail, 
  Calendar, 
  Gift, 
  Bookmark, 
  Tag,
  Edit,
  MessageSquare,
  Bell,
  Check,
  Copy
} from "lucide-react"

// Types for customer profile data
type CustomerProfile = {
  _id: string
  name: string
  email: string
  role: string
  image?: string
  referredBy?: {
    id: string
    name: string
    email: string
  }
  businessId?: string
  businessName?: string
  conversionStatus: 'pending' | 'converted' | 'lost'
  conversionDate?: string
  referralCode?: string
  loyaltyPoints?: number
  dateJoined: string
  preferences?: {
    categories?: string[]
    communicationPreferences?: {
      email: boolean
      sms: boolean
    }
  }
  customerValue?: number
  notes?: string
}

export default function CustomerProfile() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
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
        const response = await fetch("/api/customer/profile")
        
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
          const mockProfile: CustomerProfile = {
            _id: session.user.id,
            name: session.user.name ?? "Customer User",
            email: session.user.email ?? "customer@example.com",
            role: "customer",
            image: undefined,
            referredBy: {
              id: "ref123",
              name: "John Referrer",
              email: "john@example.com"
            },
            businessId: "business123",
            businessName: "Demo Business",
            conversionStatus: 'converted',
            conversionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            referralCode: "CUST" + Math.random().toString(36).substring(2, 8).toUpperCase(),
            loyaltyPoints: 125,
            dateJoined: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            preferences: {
              categories: ["Electronics", "Home Goods"],
              communicationPreferences: {
                email: true,
                sms: false
              }
            },
            customerValue: 450.75
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
            <Badge className="mx-auto mt-2">
              Customer
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{profile.email}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">Member since {formatDate(profile.dateJoined)}</span>
            </div>
            <div className="flex items-center">
              <Gift className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="text-sm">{profile.loyaltyPoints || 0} Loyalty Points</span>
            </div>
            <Separator />
            {profile.referralCode && (
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
            )}
          </CardContent>
        </Card>

        {/* Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center">
                  <Tag className="h-8 w-8 mb-2 text-primary" />
                  <p className="text-2xl font-bold">${profile.customerValue?.toFixed(2) || "0.00"}</p>
                  <p className="text-xs text-muted-foreground">Customer Value</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center">
                  <Bookmark className="h-8 w-8 mb-2 text-primary" />
                  <p className="text-2xl font-bold">{profile.loyaltyPoints || 0}</p>
                  <p className="text-xs text-muted-foreground">Loyalty Points</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for more details */}
          <Tabs defaultValue="referral">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="referral">Referral Info</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="business">Business Details</TabsTrigger>
            </TabsList>
            <TabsContent value="referral" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Referral Information</CardTitle>
                  <CardDescription>
                    Details about your referral
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.referredBy ? (
                      <div>
                        <p className="text-sm font-medium mb-1">Referred By</p>
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback>
                              {profile.referredBy.name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm">{profile.referredBy.name}</p>
                            <p className="text-xs text-muted-foreground">{profile.referredBy.email}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium mb-1">Referral Status</p>
                        <p className="text-sm">Not referred by anyone</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium mb-1">Conversion Status</p>
                      <div className="flex items-center">
                        <Badge variant={
                          profile.conversionStatus === "converted" ? "default" : 
                          profile.conversionStatus === "pending" ? "outline" : 
                          "destructive"
                        }>
                          {profile.conversionStatus.charAt(0).toUpperCase() + profile.conversionStatus.slice(1)}
                        </Badge>
                        {profile.conversionDate && profile.conversionStatus === "converted" && (
                          <span className="text-xs text-muted-foreground ml-2">
                            on {formatDate(profile.conversionDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    {profile.referralCode && (
                      <div>
                        <p className="text-sm font-medium mb-1">Your Referral Code</p>
                        <p className="text-sm font-mono">{profile.referralCode}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="preferences" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Preferences</CardTitle>
                  <CardDescription>
                    Customize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.preferences?.categories?.map((category, index) => (
                          <Badge key={index} variant="outline">
                            {category}
                          </Badge>
                        ))}
                        {(!profile.preferences?.categories || profile.preferences.categories.length === 0) && (
                          <p className="text-sm text-muted-foreground">No interests set</p>
                        )}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Communication Preferences</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">Email Notifications</span>
                          </div>
                          <Badge variant={profile.preferences?.communicationPreferences?.email ? "default" : "outline"}>
                            {profile.preferences?.communicationPreferences?.email ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">SMS Notifications</span>
                          </div>
                          <Badge variant={profile.preferences?.communicationPreferences?.sms ? "default" : "outline"}>
                            {profile.preferences?.communicationPreferences?.sms ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Update Preferences
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="business" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Information</CardTitle>
                  <CardDescription>
                    Details about the business you're connected to
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-1">Business Name</p>
                      <p className="text-sm">{profile.businessName || "Not available"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Customer Since</p>
                      <p className="text-sm">{formatDate(profile.dateJoined)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">Conversion Status</p>
                      <Badge variant={
                        profile.conversionStatus === "converted" ? "default" : 
                        profile.conversionStatus === "pending" ? "outline" : 
                        "destructive"
                      }>
                        {profile.conversionStatus.charAt(0).toUpperCase() + profile.conversionStatus.slice(1)}
                      </Badge>
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