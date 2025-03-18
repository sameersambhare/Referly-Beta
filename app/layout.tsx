import { Inter } from "next/font/google"
import { type Metadata } from "next"

import { Toaster } from "./components/ui/toaster"
import { Navbar } from "./components/layout/navbar"
import { Footer } from "./components/layout/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { RouteProvider } from "@/components/providers/route-provider"
import { Providers } from "./providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Referly - Referral Management Platform",
  description: "A comprehensive referral management platform for businesses",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <RouteProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <Toaster />
            </RouteProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
