"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function PublicIndexPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the referral tasks page
    router.push("/routes/public/referral-tasks")
  }, [router])
  
  return (
    <div className="container py-10 text-center">
      <p>Redirecting...</p>
    </div>
  )
} 