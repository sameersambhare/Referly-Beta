"use client"

import React, { useState, useEffect } from 'react'
import { ReferrerInterface } from '@/app/components/referrer/ReferrerInterface'

interface ReferralData {
  referrerName: string;
  businessName: string;
  rewardType: "fixed" | "percentage";
  rewardValue: number;
}

interface ReferrerPageProps {
  params: { businessCode: string }
}

export default function ReferrerPage({ params }: ReferrerPageProps) {
  const [loading, setLoading] = useState(true)
  const [referralData, setReferralData] = useState<ReferralData>({
    referrerName: "",
    businessName: "",
    rewardType: "fixed",
    rewardValue: 0
  })

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const response = await fetch(`/api/referrals/info/${params.businessCode}`)
        if (!response.ok) {
          throw new Error("Failed to fetch referral data")
        }
        const data = await response.json()
        setReferralData(data)
      } catch (error) {
        console.error("Error fetching referral data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferralData()
  }, [params.businessCode])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container py-10">
      <ReferrerInterface 
        referralCode={params.businessCode}
        referrerName={referralData.referrerName}
        businessName={referralData.businessName}
        rewardType={referralData.rewardType}
        rewardValue={referralData.rewardValue}
      />
    </div>
  )
} 