"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/app/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/app/components/ui/sheet"
import { ThemeToggle } from "@/app/components/ui/theme-toggle"
import { Icons } from "@/app/components/icons"
import { Avatar } from "@radix-ui/react-avatar"

// Extend the Session type to include role
interface ExtendedUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: 'business' | 'referrer' | 'admin';
}

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const user = session?.user as ExtendedUser | undefined
  const [isOpen, setIsOpen] = React.useState(false)
  
  const isActive = (path: string) => {
    return pathname === path
      ? "text-primary font-medium"
      : "text-muted-foreground hover:text-foreground"
  }

  const navigationItems = React.useMemo(() => {
    if (status !== "authenticated" || !user?.role) return []

    switch (user.role) {
      case "business":
        return [
          { href: "/dashboard", label: "Dashboard" },
          { href: "/campaigns", label: "Campaigns" },
          { href: "/customers", label: "Customers" },
          { href: "/referrals", label: "Referrals" },
          { href: "/follow-ups", label: "Follow-ups" },
          { href: "/analytics", label: "Analytics" },
        ]
      case "referrer":
        return [
          { href: "/referrer/dashboard", label: "Available Campaigns" },
          { href: "/referrer/referrals", label: "My Referrals" },
          { href: "/referrer/rewards", label: "Rewards" },
        ]
      case "admin":
        return [
          { href: "/admin", label: "Admin Dashboard" },
          { href: "/admin/users", label: "Users" },
          { href: "/admin/stats", label: "Statistics" },
        ]
      default:
        return []
    }
  }, [user?.role, status])
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2 mr-6">
            <Icons.logo className="h-6 w-6" aria-hidden="true" />
            <span className="font-bold text-xl">Referly</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={isActive(item.href)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Navigation */}
          {status === "authenticated" && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0">
                  <Icons.menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-4">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        pathname === item.href
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {status === "authenticated" ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full border-blue-400 border items-center justify-center flex  "
                  aria-label="User menu"
                >
                  <h3>SS</h3>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.name && (
                      <p className="font-medium">{user.name}</p>
                    )}
                    {user?.email && (
                      <p className="w-full truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link 
                    href={user?.role === "referrer" ? "/referrer/profile" : "/profile"}
                    className="w-full"
                  >
                    <Icons.user className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link 
                    href={user?.role === "referrer" ? "/referrer/settings" : "/settings"}
                    className="w-full"
                  >
                    <Icons.settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onSelect={(event) => {
                    event.preventDefault()
                    signOut({
                      callbackUrl: "/auth/select-role",
                    })
                  }}
                >
                  <Icons.logout className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/auth/select-role"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Sign In
              </Link>
              <Link
                href="/auth/select-role"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 