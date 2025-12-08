import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, VT323 } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { CustomCursor } from '@/components/ui/custom-cursor'
import { MobileNav } from '@/components/layout/mobile-nav'
import { ThemeProvider } from '@/components/theme-provider'
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
  icons: {
    icon: '/logo-symbol-only.png',
    apple: '/logo-symbol-only.png',
  },
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${vt323.variable} font-body antialiased selection:bg-neon-green selection:text-black overflow-x-hidden cursor-none`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
          <CustomCursor />
          <div className="animated-bg">
            <div className="animated-blob blob-1" />
            <div className="animated-blob blob-2" />
            <div className="animated-blob blob-3" />
          </div>
          {children}
          <MobileNav />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
