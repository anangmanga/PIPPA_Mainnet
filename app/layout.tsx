import type React from "react"
import type { Metadata } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AnimationProvider } from "@/lib/animation-context"
import { SmoothScrollProvider } from "@/components/apple-style/smooth-scroll"
import { PiNetworkProvider } from "@/components/providers/pi-network-provider"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: "Pippa NFTs - Pi Network",
  description: "Discover and collect Pippa Pie NFTs on Pi Network. Unique characters with traits and accessories.",
  generator: "Junmanpi",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fjalla+One&display=swap" rel="stylesheet" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />
        <Script id="pi-sdk-init" strategy="beforeInteractive">
          {`
            const Pi = window.Pi;
            if (Pi) {
              Pi.init({ version: "2.0"});
            }
          `}
        </Script>
        <AnimationProvider>
          <SmoothScrollProvider>
            <PiNetworkProvider>{children}</PiNetworkProvider>
          </SmoothScrollProvider>
        </AnimationProvider>
      </body>
    </html>
  )
}