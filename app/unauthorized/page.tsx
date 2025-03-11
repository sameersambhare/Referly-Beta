"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/app/components/ui/button"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  useEffect(() => {
    // If not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])
  
  // Determine where to redirect the user based on their role
  const handleRedirectToDashboard = () => {
    if (session?.user?.role === "business") {
      router.push("/dashboard")
    } else if (session?.user?.role === "referrer") {
      router.push("/referrer/dashboard")
    } else if (session?.user?.role === "admin") {
      router.push("/admin/dashboard")
    } else {
      router.push("/dashboard")
    }
  }
  
  if (status === "loading") {
    return (
      <div className="container flex h-screen w-screen flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="max-w-md text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have permission to access this page. This area is restricted to authorized users only.
        </p>
        <div className="flex flex-col space-y-2">
          <Button onClick={handleRedirectToDashboard}>
            Go to Dashboard
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 