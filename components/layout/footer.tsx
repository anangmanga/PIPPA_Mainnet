"use client"

import Link from "next/link"
import { MovingTicker } from "./moving-ticker"
import { Youtube, Twitter, Instagram } from "lucide-react"

type FooterLinkItem = {
  id: string
  label: string
  href: string
}

type FooterCallout = {
  heading?: string | null
  body?: string | null
}

type FooterProps = {
  links?: FooterLinkItem[]
  callout?: FooterCallout
}

const fallbackLinks: FooterLinkItem[] = [
  { id: "how-to-get", label: "HOW TO GET", href: "/how-to-get" },
  { id: "faq", label: "FAQ", href: "/faq" },
  { id: "terms-of-service", label: "TERMS OF SERVICE", href: "/terms-of-service" },
  { id: "privacy-policy", label: "PRIVACY POLICY", href: "/privacy-policy" },
]

const fallbackTicker = "WELCOME TO THE HOME OF THE PIPPA, THE ART WORLD!"
const fallbackFootnote = "COPYRIGHT © 2025 -- PIPPA NFT COLLECTION -- ALL RIGHTS RESERVED"

function mergeFooterLinks(links?: FooterLinkItem[]) {
  if (!links?.length) return fallbackLinks
  const extras = fallbackLinks.filter((fallback) => !links.some((link) => link.href === fallback.href))
  return [...links, ...extras]
}

export function Footer({ links, callout }: FooterProps) {
  const legalLinks = mergeFooterLinks(links)
  const tickerText = callout?.heading?.trim() || fallbackTicker
  const footnote = callout?.body?.trim() || fallbackFootnote

  return (
    <footer className="relative">
      {/* Footer Ticker */}
      <MovingTicker text={tickerText} />
      
      {/* Footer Content */}
      <div className="bg-transparent py-10 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Social Media Icons */}
          <div className="flex flex-col items-center gap-4">
            <h3 className="text-base sm:text-lg font-semibold uppercase tracking-wide text-foreground text-center">
              Follow us, fellow Pippas
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <a
                href="https://www.youtube.com/@Pippa.thepie"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-red-500/90 hover:bg-red-500 flex items-center justify-center transition-colors shadow-md"
                aria-label="YouTube"
              >
                <Youtube className="w-6 h-6 text-white" fill="white" />
              </a>
              <a
                href="https://x.com/pippathepie?s=21"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-sky-500/90 hover:bg-sky-500 flex items-center justify-center transition-colors shadow-md"
                aria-label="Twitter"
              >
                <Twitter className="w-6 h-6 text-white" fill="white" />
              </a>
              <a
                href="https://www.instagram.com/pippa.thepie?igsh=b2g3aDRhZ2lvdWhw&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center transition-colors shadow-md"
                aria-label="Instagram"
              >
                <Instagram className="w-6 h-6 text-white" fill="white" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          <div className="flex flex-col items-center gap-3 text-xs sm:text-sm text-muted-foreground text-center">
            <p className="max-w-2xl">{footnote}</p>
            <div className="flex flex-wrap gap-3 md:gap-6 justify-center">
              {legalLinks.map((link) => (
                <Link key={link.id} href={link.href} className="hover:text-primary transition-colors">
                  {link.label}
              </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
