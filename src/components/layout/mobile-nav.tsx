'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Scroll, Trophy, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/quests', label: 'Quests', icon: Scroll },
  { href: '/leaderboard', label: 'Ranks', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  // Don't show on auth pages
  if (pathname?.startsWith('/auth') || pathname === '/welcome') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-card border-t border-white/10 px-2 py-2 safe-area-bottom">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors active:scale-95',
                  isActive 
                    ? 'text-neon-green' 
                    : 'text-gray-500 hover:text-white active:text-white'
                )}
              >
                <item.icon 
                  className={cn(
                    'h-6 w-6 transition-all',
                    isActive && 'drop-shadow-[0_0_8px_rgba(0,255,136,0.8)]'
                  )} 
                />
                <span className={cn(
                  'text-[10px] font-medium uppercase tracking-wide',
                  isActive && 'text-neon-green'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

