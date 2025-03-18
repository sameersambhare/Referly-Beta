"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Button } from "@/app/components/ui/button"
import { CouponRewards } from "@/app/components/dashboard/CouponRewards"
import { Loader2 } from "lucide-react"

interface Referral {
  id: string
  name: string
  email: string
  status: string
  referralDate: string
  conversions: number
}

export default function RewardsPage() {
  const { data: session, status } = useSession()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReferrals = async () => {
      if (status === "authenticated") {
        try {
          setLoading(true)
          // This would be replaced with an actual API call in a real application
          // const response = await fetch("/api/referrals")
          // const data = await response.json()
          
          // Mock data for demonstration
          const mockData = [
            {
              id: "ref-001",
              name: "John Doe",
              email: "john@example.com",
              status: "active",
              referralDate: "2023-05-15",
              conversions: 3
            },
            {
              id: "ref-002",
              name: "Jane Smith",
              email: "jane@example.com",
              status: "active",
              referralDate: "2023-06-20",
              conversions: 5
            },
            {
              id: "ref-003",
              name: "Robert Johnson",
              email: "robert@example.com",
              status: "inactive",
              referralDate: "2023-04-10",
              conversions: 1
            }
          ]
          
          setReferrals(mockData)
        } catch (err: any) {
          setError(err.message || "Failed to fetch referrals")
          console.error("Error fetching referrals:", err)
        } finally {
          setLoading(false)
        }
      }
    }
    
    fetchReferrals()
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Rewards Management</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Rewards Management</h1>
      
      <Tabs defaultValue="available" className="mb-8">
        <TabsList>
          <TabsTrigger value="available">Available Rewards</TabsTrigger>
          <TabsTrigger value="eligible">Eligible Referrers</TabsTrigger>
          <TabsTrigger value="history">Reward History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="available" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="md:col-span-2">
              <CouponRewards />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="eligible" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Eligible Referrers</CardTitle>
              <CardDescription>
                These referrers have met the criteria for rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Conversions</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {referrals.map((referral) => (
                      <tr key={referral.id}>
                        <td className="px-4 py-3 text-sm">{referral.name}</td>
                        <td className="px-4 py-3 text-sm">{referral.email}</td>
                        <td className="px-4 py-3 text-sm">{referral.conversions}</td>
                        <td className="px-4 py-3 text-sm capitalize">{referral.status}</td>
                        <td className="px-4 py-3 text-sm">
                          <Button size="sm">Reward</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Reward History</CardTitle>
              <CardDescription>
                Track all rewards issued to your referrers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No rewards have been issued yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 