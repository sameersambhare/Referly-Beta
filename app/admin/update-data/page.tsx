"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Icons } from "@/components/icons"

export default function AdminUpdatePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Check if user is admin
  if (session?.user?.role !== "admin") {
    return (
      <div className="container py-10">
        <Alert variant="destructive">
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>
            You do not have permission to access this page.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.push("/")}>Return to Home</Button>
        </div>
      </div>
    )
  }

  const handleUpdateAll = async () => {
    try {
      setLoading(true)
      setError(null)
      setResults(null)

      const response = await fetch("/api/admin/update-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update data")
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error("Error updating data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateBusinesses = async () => {
    try {
      setLoading(true)
      setError(null)
      setResults(null)

      const response = await fetch("/api/admin/update-businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update businesses")
      }

      const data = await response.json()
      setResults({ businesses: data })
    } catch (err) {
      console.error("Error updating businesses:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateReferrers = async () => {
    try {
      setLoading(true)
      setError(null)
      setResults(null)

      const response = await fetch("/api/admin/update-referrers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update referrers")
      }

      const data = await response.json()
      setResults({ referrers: data })
    } catch (err) {
      console.error("Error updating referrers:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCampaigns = async () => {
    try {
      setLoading(true)
      setError(null)
      setResults(null)

      const response = await fetch("/api/admin/update-campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update campaigns")
      }

      const data = await response.json()
      setResults({ campaigns: data })
    } catch (err) {
      console.error("Error updating campaigns:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleLinkReferrers = async () => {
    try {
      setLoading(true)
      setError(null)
      setResults(null)

      const response = await fetch("/api/admin/link-referrers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to link referrers")
      }

      const data = await response.json()
      setResults({ links: data })
    } catch (err) {
      console.error("Error linking referrers:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Data Update</h1>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Update All Data</CardTitle>
            <CardDescription>
              Run all update operations in sequence to ensure data consistency
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={handleUpdateAll} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update All Data"
              )}
            </Button>
          </CardFooter>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Update Businesses</CardTitle>
              <CardDescription>
                Update business users with company information
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                onClick={handleUpdateBusinesses} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Update Businesses
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Referrers</CardTitle>
              <CardDescription>
                Update referrer users with company information
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                onClick={handleUpdateReferrers} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Update Referrers
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Campaigns</CardTitle>
              <CardDescription>
                Update campaigns with company information
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                onClick={handleUpdateCampaigns} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Update Campaigns
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Link Referrers</CardTitle>
              <CardDescription>
                Link referrers to businesses based on company name
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button 
                onClick={handleLinkReferrers} 
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                Link Referrers
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 