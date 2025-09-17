import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'DebtWise AI - AI-Powered Debt Collection Management',
    template: '%s | DebtWise AI'
  },
  description: 'Advanced AI-powered debt collection management platform with intelligent voice calling, real-time transcription, and automated analysis.',
  keywords: ['debt collection', 'AI', 'voice calling', 'fintech', 'automation', 'transcription'],
  authors: [{ name: 'DebtWise AI Team' }],
  creator: 'DebtWise AI',
  publisher: 'DebtWise AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://debtwise-ai.vercel.app'),
  openGraph: {
    title: 'DebtWise AI - AI-Powered Debt Collection Management',
    description: 'Advanced AI-powered debt collection management platform with intelligent voice calling and automated analysis.',
    url: 'https://debtwise-ai.vercel.app',
    siteName: 'DebtWise AI',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DebtWise AI - AI-Powered Debt Collection Management',
    description: 'Advanced AI-powered debt collection management platform with intelligent voice calling and automated analysis.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#f8fafc',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
