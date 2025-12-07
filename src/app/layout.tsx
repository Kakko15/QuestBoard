import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, VT323 } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { CustomCursor } from '@/components/ui/custom-cursor'
import { MobileNav } from '@/components/layout/mobile-nav'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
})

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
})

export const metadata: Metadata = {
  title: 'QuestBoard 2025',
  description: 'Gamified Student Engagement Ecosystem',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${vt323.variable} font-body antialiased selection:bg-neon-green selection:text-black overflow-x-hidden cursor-none`}>
        <CustomCursor />
        {children}
        <MobileNav />
        <Toaster />
      </body>
    </html>
  )
}
