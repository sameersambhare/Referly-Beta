"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Icons } from "@/components/icons"
import { Session } from "next-auth"

interface CustomerLayoutClientProps {
  children: React.ReactNode
  session: Session
}

export default function CustomerLayoutClient({ 
  children,
  session
}: CustomerLayoutClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Redirect if not authenticated or not a customer
  useEffect(() => {
    if (isMounted && session.user.role !== "customer") {
      router.push("/auth/select-role")
    }
  }, [isMounted, session, router])

  // Don't render anything until we know the authentication status
  if (!isMounted || session.user.role !== "customer") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const navigation = [
    { name: "Dashboard", href: "/customer/dashboard", icon: Icons.dashboard },
    { name: "My Campaigns", href: "/customer/campaigns", icon: Icons.megaphone },
    { name: "Rewards", href: "/customer/rewards", icon: Icons.gift },
    { name: "Profile", href: "/customer/profile", icon: Icons.user },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 border-b bg-background lg:hidden">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Icons.menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 sm:w-72">
                <div className="flex items-center gap-2 pb-4 pt-2">
                  <Image
                    src="/logo.png"
                    alt="Logo"
                    width={30}
                    height={30}
                    className="mr-2"
                  />
                  <span className="text-lg font-semibold">Referly</span>
                </div>
                <nav className="flex flex-col gap-2">
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/customer/dashboard" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Logo"
                width={30}
                height={30}
                className="mr-2"
              />
              <span className="text-lg font-semibold">Referly</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/customer/profile")}
            >
              <Icons.user className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-background lg:flex">
          <div className="flex h-16 items-center gap-2 border-b px-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={30}
              height={30}
              className="mr-2"
            />
            <span className="text-lg font-semibold">Referly</span>
          </div>
          <nav className="flex flex-col gap-2 p-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
} 