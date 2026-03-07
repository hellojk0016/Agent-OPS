import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NextAuthProvider from '@/components/NextAuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Agents OPS',
  description: 'Multi-tenant task management app',
  manifest: '/manifest.json',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-100`}>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  )
}
