"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "../ui/button"

// Extend the Session type to include role
interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
}

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const user = session?.user as ExtendedUser | undefined
  
  const isActive = (path: string) => {
    return pathname === path
      ? "text-primary font-medium"
      : "text-muted-foreground hover:text-foreground"
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Referly</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6">
            {status === "authenticated" && user?.role === "business" && (
              <>
                <Link href="/dashboard" className={isActive("/dashboard")}>
                  Dashboard
                </Link>
                <Link href="/campaigns" className={isActive("/campaigns")}>
                  Campaigns
                </Link>
                <Link href="/customers" className={isActive("/customers")}>
                  Customers
                </Link>
                <Link href="/referrals" className={isActive("/referrals")}>
                  Referrals
                </Link>
                <Link href="/follow-ups" className={isActive("/follow-ups")}>
                  Follow-ups
                </Link>
                <Link href="/analytics" className={isActive("/analytics")}>
                  Analytics
                </Link>
              </>
            )}
            {status === "authenticated" && user?.role === "admin" && (
              <>
                <Link href="/admin" className={isActive("/admin")}>
                  Admin Dashboard
                </Link>
                <Link href="/admin/users" className={isActive("/admin/users")}>
                  Users
                </Link>
                <Link href="/admin/stats" className={isActive("/admin/stats")}>
                  Statistics
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center space-x-2">
            {status === "authenticated" ? (
              <>
                <span className="text-sm text-muted-foreground mr-2">
                  {user?.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 