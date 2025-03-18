"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

// List of public routes that don't require authentication
const publicRoutes = [
  "/auth",
  "/auth/business/login",
  "/auth/business/register",
  "/referrer/login",
  "/referrer/register",
  "/",
  "/terms",
  "/privacy"
]

// List of business-only routes
const businessRoutes = [
  "/dashboard",
  "/campaigns",
  "/customers",
  "/referrals",
  "/follow-ups",
  "/analytics"
]

// List of referrer-only routes
const referrerRoutes = [
  "/referrer/dashboard",
  "/referrer/referrals",
  "/referrer/rewards",
  "/referrer/profile"
]

// List of admin-only routes
const adminRoutes = [
  "/admin"
]

export function RouteProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Skip redirect for loading state
    if (status === "loading") {
      return
    }

    // Skip redirect for public routes
    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(route)
    )
    
    if (isPublicRoute) {
      return
    }

    // Handle unauthenticated users trying to access protected routes
    if (status === "unauthenticated") {
      router.push("/auth/select-role")
      return
    }

    // Handle authenticated users based on their role
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role

      // Check if user is trying to access a route they don't have permission for
      const isBusinessRoute = businessRoutes.some(route => 
        pathname === route || pathname.startsWith(route)
      )
      
      const isReferrerRoute = referrerRoutes.some(route => 
        pathname === route || pathname.startsWith(route)
      )
      
      const isAdminRoute = adminRoutes.some(route => 
        pathname === route || pathname.startsWith(route)
      )

      // Redirect if user is trying to access a route they don't have permission for
      if (isBusinessRoute && role !== "business" && role !== "admin") {
        router.push("/auth/select-role")
        return
      }
      
      if (isReferrerRoute && role !== "referrer" && role !== "admin") {
        router.push("/auth/select-role")
        return
      }
      
      if (isAdminRoute && role !== "admin") {
        router.push("/auth/select-role")
        return
      }

      // Redirect to appropriate dashboard if on a generic route
      if (pathname === "/") {
        router.push(
          role === "business" 
            ? "/dashboard" 
            : role === "referrer" 
              ? "/referrer/dashboard" 
              : "/admin"
        )
      }
    }
  }, [status, session, pathname, router])

  return children
} 