"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface RewardHistory {
  id: string
  referrerName: string
  referrerEmail: string
  rewardType: string
  rewardDetails: string
  issuedDate: string
  status: string
}

export default function RewardHistoryPage() {
  const { data: session, status } = useSession()
  const [rewardHistory, setRewardHistory] = useState<RewardHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRewardHistory = async () => {
      if (status === "authenticated") {
        try {
          setLoading(true)
          // This would be replaced with an actual API call in a real application
          // const response = await fetch("/api/rewards/history")
          // const data = await response.json()
          
          // Mock data for demonstration
          const mockData = [
            {
              id: "reward-001",
              referrerName: "John Doe",
              referrerEmail: "john@example.com",
              rewardType: "coupon",
              rewardDetails: "20% off on all products",
              issuedDate: "2023-06-15",
              status: "sent"
            },
            {
              id: "reward-002",
              referrerName: "Jane Smith",
              referrerEmail: "jane@example.com",
              rewardType: "coupon",
              rewardDetails: "Free shipping on next order",
              issuedDate: "2023-07-20",
              status: "sent"
            },
            {
              id: "reward-003",
              referrerName: "Robert Johnson",
              referrerEmail: "robert@example.com",
              rewardType: "coupon",
              rewardDetails: "$10 off on orders above $50",
              issuedDate: "2023-08-10",
              status: "pending"
            }
          ]
          
          setRewardHistory(mockData)
        } catch (err: any) {
          setError(err.message || "Failed to fetch reward history")
          console.error("Error fetching reward history:", err)
        } finally {
          setLoading(false)
        }
      }
    }
    
    fetchRewardHistory()
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Reward History</h1>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <div className="flex items-center mb-6">
        <Link href="/rewards" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Reward History</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Past Rewards</CardTitle>
          <CardDescription>
            All rewards issued to your referrers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rewardHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No rewards have been issued yet.
            </p>
          ) : (
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-medium">Referrer</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Reward</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Issued Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rewardHistory.map((reward) => (
                    <tr key={reward.id}>
                      <td className="px-4 py-3 text-sm">{reward.referrerName}</td>
                      <td className="px-4 py-3 text-sm">{reward.referrerEmail}</td>
                      <td className="px-4 py-3 text-sm">{reward.rewardDetails}</td>
                      <td className="px-4 py-3 text-sm">{new Date(reward.issuedDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm capitalize">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          reward.status === 'sent' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                        }`}>
                          {reward.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <Button size="sm" variant="outline">Resend</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 