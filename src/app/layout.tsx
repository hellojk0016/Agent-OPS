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
  title: 'Agent OPS',
  description: 'Multi-tenant Task Management — neon-powered PWA',
  manifest: '/manifest.json',
  applicationName: 'Agent OPS',
  keywords: ['task management', 'kanban', 'team', 'productivity', 'PWA'],
  authors: [{ name: 'Agent OPS' }],

  // Apple PWA meta
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Agent OPS',
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
    title: 'Agent OPS',
    description: 'Multi-tenant Task Management',
    siteName: 'Agent OPS',
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
        <meta name="apple-mobile-web-app-title" content="Agent OPS" />
        {/* MS Tile */}
        <meta name="msapplication-TileImage" content="/icon-144x144.png" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body className={`${spaceGrotesk.variable} font-sans min-h-screen bg-zinc-950 text-zinc-100`}>
        <NextAuthProvider>
          <ToastProvider>
            {children}
            <PWAInstallPrompt />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  if ('serviceWorker' in navigator) {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js').then(function(registration) {
                        console.log('SW registered: ', registration);
                        registration.onupdatefound = () => {
                          const installingWorker = registration.installing;
                          if (installingWorker) {
                            installingWorker.onstatechange = () => {
                              if (installingWorker.state === 'installed') {
                                if (navigator.serviceWorker.controller) {
                                  console.log('New content is available; please refresh.');
                                } else {
                                  console.log('Content is cached for offline use.');
                                }
                              }
                            };
                          }
                        };
                      }, function(err) {
                        console.log('SW registration failed: ', err);
                      });
                    });
                  }
                `,
              }}
            />
          </ToastProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
