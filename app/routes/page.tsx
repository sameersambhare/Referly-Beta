"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RoutesIndexPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the public routes by default
    router.push("/routes/public/referral-tasks")
  }, [router])
  
  return (
    <div className="container py-10 text-center">
      <p>Redirecting...</p>
    </div>
  )
} 