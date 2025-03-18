import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/options"
import CustomerLayoutClient from "./layout-client"

export const metadata: Metadata = {
  title: "Customer Dashboard | Referly",
  description: "Manage your referrals and rewards",
}

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Redirect if not logged in
  if (!session) {
    redirect("/auth/login")
  }

  // Redirect if not a customer
  if (session.user.role !== "customer") {
    if (session.user.role === "business") {
      redirect("/business/dashboard")
    } else if (session.user.role === "referrer") {
      redirect("/referrer/dashboard")
    } else {
      redirect("/")
    }
  }

  return <CustomerLayoutClient session={session}>{children}</CustomerLayoutClient>
} 