import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "TaskFlow AI - Intelligent Task Management & Productivity",
    template: "%s | TaskFlow AI",
  },
  description:
    "TaskFlow AI is a modern task management workspace powered by artificial intelligence. Plan work, track priorities, and help your team move projects forward with focus.",
  keywords: [
    "TaskFlow AI",
    "TaskFlow",
    "AI task management",
    "intelligent task manager",
    "project management",
    "team productivity",
    "AI productivity assistant",
    "kanban",
    "calendar tasks",
  ],
  authors: [{ name: "TaskFlow" }],
  creator: "TaskFlow",
  publisher: "TaskFlow",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TaskFlow - Focused Task Management for Productive Teams",
    description:
      "Plan your work, stay aligned, and move projects forward in a calm task management workspace.",
    url: "/",
    siteName: "TaskFlow",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "TaskFlow - Focused Task Management for Productive Teams",
    description:
      "Plan your work, stay aligned, and move projects forward in a calm task management workspace.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "TaskFlow",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "TaskFlow is a modern task management workspace for planning work, tracking priorities, and helping teams move projects forward with focus.",
    "url": siteUrl
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  )
}
