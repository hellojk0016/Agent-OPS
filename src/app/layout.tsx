import type { Metadata, Viewport } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import NextAuthProvider from '@/components/NextAuthProvider'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'Knight Wolf',
  description: 'AI-Powered Agentic Project Management System',
  manifest: '/manifest.json',
  applicationName: 'Knight Wolf',
  keywords: ['task management', 'kanban', 'team', 'productivity', 'PWA'],
  authors: [{ name: 'Knight Wolf' }],

  // Apple PWA meta
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Knight Wolf',
  },
  formatDetection: {
    telephone: false,
  },

  // Open Graph for social sharing
  openGraph: {
    type: 'website',
    url: 'https://agent-ops.vercel.app',
    title: 'Knight Wolf',
    description: 'AI-Powered Agentic Project Management System',
    siteName: 'Knight Wolf',
    images: [
      {
        url: '/ops-logo.png',
        width: 1200,
        height: 630,
        alt: 'Knight Wolf Logo',
      },
    ],
  },

  icons: {
    icon: [
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icon-512x512.png', color: '#00F5FF' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#00F5FF' },
    { media: '(prefers-color-scheme: light)', color: '#00F5FF' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

import { ToastProvider } from '@/components/ToastContext'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* iOS Standalone PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Knight Wolf" />
        {/* MS Tile */}
        <meta name="msapplication-TileImage" content="/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body className={`${spaceGrotesk.variable} font-sans min-h-screen bg-zinc-950 text-zinc-100`}>
        <NextAuthProvider>
          <ToastProvider>
            {children}
            <PWAInstallPrompt />
          </ToastProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
