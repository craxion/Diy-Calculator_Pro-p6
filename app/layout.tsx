import type React from "react"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils" // For conditionally joining class names
import { PageTransition } from "@/components/page-transition" // Import PageTransition

// Initialize Inter font with variable
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"], // Match weights from the removed @import
})

export const metadata: Metadata = {
  title: "DIYCalculatorPro - Professional Project Calculators",
  description:
    "Your go-to source for accurate project calculators. Plan smarter, build better with professional DIY calculators for construction, landscaping, carpentry and more.",
  keywords: "DIY calculator, construction calculator, project planning, material estimation, cost calculator",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased", // Use font-sans from Tailwind config
          fontSans.variable, // Apply the Inter font variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <div className="min-h-screen flex flex-col bg-brand-white">
            {" "}
            {/* Main site background */}
            <Header />
            <PageTransition>
              {" "}
              {/* Wrap children with PageTransition */}
              <main className="flex-1 py-8">
                {" "}
                {/* Add some padding to main content area */}
                {children}
              </main>
            </PageTransition>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
