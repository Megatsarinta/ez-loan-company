import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { COMPANY_LOGOS } from '@/lib/constants/company-info' // Add this import
import './globals.css'

const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'EasyLoan - For NRIs, For India',
    template: '%s | EasyLoan'
  },
  description: 'Instant loans for NRIs worldwide. No collateral, approved in 24 hours, direct to your NRE/NRO account. RBI Registered NBFC, CIBIL Partner.',
  keywords: [
    'NRI loan',
    'online loan India',
    'instant loan for NRI',
    'NRI financial assistance',
    'loan for Non-Resident Indians',
    'NRE account loan',
    'NRO account loan',
    'emergency loan NRI',
    'EasyLoan',
    'Indian loan abroad',
    'NRI home loan',
    'NRI personal loan',
  ],
  authors: [{ name: 'EasyLoan' }],
  icons: {
    icon: '/logos/EasyLoan.png', // Your company logo
    shortcut: '/logos/EasyLoan.png',
    apple: '/logos/EasyLoan.png',
  },
  openGraph: {
    title: 'EasyLoan - For NRIs, For India',
    description: 'Instant loans for NRIs worldwide. Approved in 24 hours!',
    siteName: 'EasyLoan',
    type: 'website',
    locale: 'en_IN',
    images: [
      {
        url: '/logos/EasyLoan.png', // Your company logo
        width: 1200,
        height: 630,
        alt: 'EasyLoan - For NRIs Worldwide',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EasyLoan - For NRIs',
    description: 'Instant loans for NRIs worldwide',
    images: ['/logos/EasyLoan.png'], // Your company logo
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'finance',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="next-head-count" content="3" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#F97316" />
        <meta name="application-name" content="EasyLoan" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EasyLoan" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        <meta name="geo.region" content="IN" />
        <meta name="geo.placename" content="India" />
        <meta name="target" content="NRI, Non-Resident Indians, NRIs Worldwide" />

        <meta name="format-detection" content="telephone=no, date=no, address=no" />
      </head>
      <body className={`${geist.className} font-sans antialiased min-h-screen bg-[var(--color-bg-main)] text-[var(--color-text-primary)]`} suppressHydrationWarning>
        <main className="min-h-screen">
          {children}
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}