"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  
  // Check if user is authenticated and has admin role
  if (status === "loading") {
    return <div className="container py-10">Loading...</div>
  }
  
  if (status === "unauthenticated") {
    redirect("/auth/signin?callbackUrl=/routes/admin/dashboard")
  }
  
  // In a real app, you would check if the user has the admin role
  // For now, we'll assume all authenticated users can access admin routes
  
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
} 