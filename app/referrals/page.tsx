"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"

interface Referral {
  _id: string
  referredPersonName: string
  referredPersonEmail: string
  referredPersonPhone?: string
  status: 'pending' | 'contacted' | 'converted' | 'declined'
  rewardStatus: 'pending' | 'approved' | 'paid' | 'declined'
  rewardAmount?: number
  rewardType?: 'cash' | 'discount' | 'gift' | 'points'
  notes?: string
  clickCount: number
  conversionDate?: string
  createdAt: string
  updatedAt: string
  referrerId: {
    _id: string
    name: string
    email: string
  }
}

export default function ReferralsPage() {
  const { data: session, status } = useSession()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  
  useEffect(() => {
    const fetchReferrals = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/referrals")
          
          if (!response.ok) {
            throw new Error("Failed to fetch referrals")
          }
          
          const data = await response.json()
          setReferrals(data)
          setFilteredReferrals(data)
        } catch (error) {
          setError("Error loading referrals")
          console.error(error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    fetchReferrals()
  }, [status])
  
  useEffect(() => {
    // Filter referrals based on search term and active tab
    let filtered = referrals
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        referral =>
          referral.referredPersonName.toLowerCase().includes(term) ||
          referral.referredPersonEmail.toLowerCase().includes(term) ||
          (referral.referredPersonPhone && referral.referredPersonPhone.toLowerCase().includes(term)) ||
          referral.referrerId.name.toLowerCase().includes(term) ||
          referral.referrerId.email.toLowerCase().includes(term)
      )
    }
    
    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter(referral => referral.status === activeTab)
    }
    
    setFilteredReferrals(filtered)
  }, [searchTerm, activeTab, referrals])
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }
  
  if (status === "loading" || isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Referrals</h1>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Referrals</h1>
        <div className="bg-destructive/15 p-4 rounded-md text-destructive">
          {error}
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Referrals</h1>
        <Link href="/referrals/generate">
          <Button>Generate Referral Link</Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Search referrals..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-md"
        />
      </div>
      
      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="contacted">Contacted</TabsTrigger>
          <TabsTrigger value="converted">Converted</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredReferrals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No referrals found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredReferrals.map((referral) => (
                <Card key={referral._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{referral.referredPersonName}</CardTitle>
                        <CardDescription>
                          {referral.referredPersonEmail} • {referral.referredPersonPhone || "No phone"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          referral.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                          referral.status === 'converted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                        </span>
                        <Link href={`/referrals/${referral._id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Referred By</p>
                        <p>{referral.referrerId.name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p>{new Date(referral.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reward Status</p>
                        <p className={`${
                          referral.rewardStatus === 'pending' ? 'text-yellow-600' :
                          referral.rewardStatus === 'approved' ? 'text-blue-600' :
                          referral.rewardStatus === 'paid' ? 'text-green-600' :
                          'text-red-600'
                        }`}>
                          {referral.rewardStatus.charAt(0).toUpperCase() + referral.rewardStatus.slice(1)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Clicks</p>
                        <p>{referral.clickCount}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 