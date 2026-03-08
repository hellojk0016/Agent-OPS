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
  title: 'Agents OPS',
  description: 'Multi-tenant Task Management — neon-powered PWA',
  manifest: '/manifest.json',
  applicationName: 'Agents OPS',
  keywords: ['task management', 'kanban', 'team', 'productivity', 'PWA'],
  authors: [{ name: 'Agents OPS' }],

  // Apple PWA meta
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Agents OPS',
    startupImage: [
      {
        url: '/icon-512x512.png',
        media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)',
      },
    ],
  },

  // Open Graph for social sharing
  openGraph: {
    type: 'website',
    title: 'Agents OPS',
    description: 'Multi-tenant Task Management',
    siteName: 'Agents OPS',
  },

  icons: {
    icon: [
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icon-512x512.png' },
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
        <meta name="apple-mobile-web-app-title" content="Agents OPS" />
        {/* MS Tile */}
        <meta name="msapplication-TileImage" content="/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#09090b" />
      </head>
      <body className={`${spaceGrotesk.variable} font-sans min-h-screen bg-zinc-950 text-zinc-100`}>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  )
}
