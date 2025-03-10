"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function ReferrerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  
  // Check if user is authenticated and has referrer role
  if (status === "loading") {
    return <div className="container py-10">Loading...</div>
  }
  
  if (status === "unauthenticated") {
    redirect("/auth/signin?callbackUrl=/routes/referrer/dashboard")
  }
  
  // In a real app, you would check if the user has the referrer role
  // For now, we'll assume all authenticated users can access referrer routes
  
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
} 