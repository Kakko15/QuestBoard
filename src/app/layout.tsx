import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, VT323 } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import { CustomCursor } from '@/components/ui/custom-cursor'
import { MobileNav } from '@/components/layout/mobile-nav'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
})

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
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
      <body 
        className={`${inter.variable} ${spaceGrotesk.variable} ${vt323.variable} font-body antialiased selection:bg-neon-green selection:text-black overflow-x-hidden md:cursor-none`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CustomCursor />
          {/* Adaptive gradient background - Dark & Light modes */}
          <div className="fixed inset-0 -z-10 bg-background transition-colors duration-500">
            {/* Light mode gradients */}
            <div className="absolute inset-0 dark:opacity-0 opacity-100 transition-opacity duration-500">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-neon-purple/10 via-transparent to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-neon-green/10 via-transparent to-transparent rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-pink/5 rounded-full blur-3xl" />
            </div>
            {/* Dark mode gradients */}
            <div className="absolute inset-0 dark:opacity-100 opacity-0 transition-opacity duration-500">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon-purple/5 to-transparent" />
              <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-neon-green/5 to-transparent" />
            </div>
          </div>
          <div className="pb-20 md:pb-0">
            {children}
          </div>
          <MobileNav />
          <InstallPrompt />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
