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
  title: 'AGENTS OPS',
  description: 'Multi-tenant Task Management',
  authors: [{ name: 'AGENTS OPS' }],



  // Open Graph for social sharing
  openGraph: {
    type: 'website',
    title: 'AGENTS OPS',
    description: 'Multi-tenant Task Management',
    siteName: 'AGENTS OPS',
  },

  icons: {
    icon: [
      { url: '/favicon.ico' },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <head>
      </head>
      <body className={`${spaceGrotesk.variable} font-sans min-h-screen bg-zinc-950 text-zinc-100`}>
        <NextAuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
