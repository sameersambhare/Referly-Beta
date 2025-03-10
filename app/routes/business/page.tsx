"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function BusinessIndexPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the business dashboard
    router.push("/routes/business/dashboard")
  }, [router])
  
  return (
    <div className="container py-10 text-center">
      <p>Redirecting...</p>
    </div>
  )
} 