'use client'

import { memo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Home, Scroll, Trophy, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser } from '@/hooks/use-user'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/quests', label: 'Quests', icon: Scroll },
  { href: '/leaderboard', label: 'Ranks', icon: Trophy },
  { href: '/profile', label: 'Profile', icon: User },
]

function MobileNavInner() {
  const pathname = usePathname()
  const { user } = useUser()

  // Don't show on auth pages
  if (pathname?.startsWith('/auth') || pathname === '/welcome') {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom">
      {/* Adaptive blur background */}
      <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-border/50 dark:border-white/10 shadow-lg dark:shadow-none" />
      
      <div className="relative flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1"
            >
              <div
                className={cn(
                  'flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-colors relative',
                  isActive 
                    ? 'text-neon-green' 
                    : 'text-muted-foreground active:text-foreground'
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-neon-green/10 rounded-xl" />
                )}
                <Icon className={cn('h-5 w-5 relative z-10', isActive && 'text-neon-green')} />
                <span className={cn(
                  'text-[10px] font-medium relative z-10',
                  isActive && 'text-neon-green'
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -top-1 right-1/2 translate-x-1/2 w-1 h-1 rounded-full bg-neon-green" />
                )}
              </div>
            </Link>
          )
        })}
        
        {/* Level indicator */}
        {user && (
          <div className="flex flex-col items-center gap-1 py-2 px-3">
            <div className="relative flex items-center justify-center w-10 h-10">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  className="stroke-border dark:stroke-white/10"
                  strokeWidth="3"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  className="stroke-neon-green"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={100}
                  strokeDashoffset={100 - ((user.xp % 1000) / 1000) * 100}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-neon-purple" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-neon-purple">
              Lv.{user.level}
            </span>
          </div>
        )}
      </div>
    </nav>
  )
}

// Use dynamic import with ssr: false to prevent hydration issues
export const MobileNav = dynamic(() => Promise.resolve(memo(MobileNavInner)), {
  ssr: false,
})
