"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/icons"

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const user = session?.user as ExtendedUser | undefined
  
  const isActive = (path: string) => {
    return pathname === path
      ? "text-primary font-medium"
      : "text-muted-foreground hover:text-foreground"
  }

  const navigation = pathname.startsWith("/referrer")
    ? [
        {
          name: "Available Campaigns",
          href: "/referrer/dashboard",
          current: pathname === "/referrer/dashboard",
        },
        {
          name: "My Referrals",
          href: "/referrer/referrals",
          current: pathname === "/referrer/referrals",
        },
        {
          name: "Rewards",
          href: "/referrer/rewards",
          current: pathname === "/referrer/rewards",
        },
      ]
    : [
        {
          name: "Dashboard",
          href: "/dashboard",
          current: pathname === "/dashboard",
        },
        {
          name: "Campaigns",
          href: "/campaigns",
          current: pathname === "/campaigns",
        },
        {
          name: "Analytics",
          href: "/analytics",
          current: pathname === "/analytics",
        },
      ]

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          <Link href={pathname.startsWith("/referrer") ? "/referrer/dashboard" : "/dashboard"}>
            <div className="flex items-center space-x-2">
              <Icons.logo className="h-6 w-6" />
              <span className="font-bold">Referly</span>
            </div>
          </Link>
        </div>

        {session?.user ? (
          <>
            <div className="ml-10 flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive(item.href),
                    "text-sm font-medium transition-colors"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="ml-auto flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Icons.user className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user?.name && (
                        <p className="font-medium">{user.name}</p>
                      )}
                      {user?.email && (
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={pathname.startsWith("/referrer") ? "/referrer/profile" : "/profile"}>
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={pathname.startsWith("/referrer") ? "/referrer/settings" : "/settings"}>
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onSelect={(event) => {
                      event.preventDefault()
                      signOut({
                        callbackUrl: "/auth/select-role",
                      })
                    }}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <div className="ml-auto flex items-center space-x-4">
            <Link
              href="/auth/select-role"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "px-4"
              )}
            >
              Login
            </Link>
            <Link
              href="/auth/select-role"
              className={cn(buttonVariants({ size: "sm" }), "px-4")}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
} 