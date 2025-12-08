'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Home,
  Scroll,
  Trophy,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Shield,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ui/mode-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GuildBadge } from '@/components/game/guild-badge'
import { NotificationsDropdown } from '@/components/layout/notifications-dropdown'
import { SearchCommand, useSearchCommand } from '@/components/layout/search-command'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types'

interface NavbarProps {
  user: UserProfile | null
  onSignOut?: () => void
}

const navItems = [
  { href: '/', label: 'HOME', icon: Home },
  { href: '/quests', label: 'QUESTS', icon: Scroll },
  { href: '/leaderboard', label: 'RANKS', icon: Trophy },
  { href: '/profile', label: 'PROFILE', icon: User },
]

export function Navbar({ user, onSignOut }: NavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { open: searchOpen, setOpen: setSearchOpen } = useSearchCommand()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-7xl glass-card flex items-center justify-between rounded-2xl px-4 md:px-6 py-3 shadow-lg shadow-black/10">
        <div className="flex items-center gap-4 lg:gap-8">
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-neon-purple text-white shadow-lg shadow-neon-purple/20 overflow-hidden shrink-0"
            >
              <Image 
                src="/logo-symbol-only.png" 
                alt="QuestBoard Logo" 
                fill
                sizes="40px"
                className="object-cover p-1"
              />
            </motion.div>
            <span className="font-display text-xl font-bold tracking-tight hidden lg:block group-hover:text-neon-purple transition-colors whitespace-nowrap">
              QUEST<span className="text-neon-green">BOARD</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex bg-secondary/50 rounded-full p-1 border border-border/50 shrink-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'relative px-3 lg:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2',
                      isActive 
                        ? 'text-primary-foreground bg-primary font-bold shadow-lg shadow-primary/20' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden lg:inline relative z-10">{item.label}</span>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm xl:max-w-md mx-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="relative w-full group flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 bg-secondary/50 border border-border/50 rounded-full text-left hover:bg-background hover:border-primary/50 transition-all"
          >
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="flex-1 text-sm text-muted-foreground truncate hidden sm:block">Search...</span>
            <span className="flex-1 text-sm text-muted-foreground truncate hidden lg:block sm:hidden">Search quests, guilds...</span>
            <kbd className="hidden lg:inline-flex h-5 items-center gap-1 rounded border border-border/50 bg-background/50 px-1.5 font-mono text-[10px] text-muted-foreground shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          <div className="hidden sm:block">
            <ModeToggle />
          </div>
          {user && <NotificationsDropdown />}

          <div className="h-8 w-px bg-border mx-1 hidden md:block" />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 lg:gap-3 outline-none group"
                >
                  <div className="text-right hidden xl:block">
                    <div className="text-xs font-medium text-muted-foreground group-hover:text-neon-green transition-colors">Level {user.level}</div>
                    <div className="text-sm font-bold font-display truncate max-w-[100px]">{user.firstName}</div>
                  </div>
                  <Avatar className="h-9 w-9 lg:h-10 lg:w-10 border-2 border-white/10 group-hover:border-neon-green transition-colors">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="bg-neon-purple text-white font-bold">
                      {user.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass-card border-border/50 p-2 rounded-xl mt-2">
                <div className="flex items-center gap-3 p-2 mb-2 bg-secondary/50 rounded-lg">
                  <GuildBadge college={user.college} size="sm" />
                  <div>
                    <div className="text-xs text-muted-foreground">Current Guild</div>
                    <div className="font-bold text-sm">{user.college}</div>
                  </div>
                </div>
                <DropdownMenuItem asChild className="focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-md">
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-neon-blue" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-md">
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-neon-pink" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {(user.role === 'quest_giver' || user.role === 'game_master') && (
                  <DropdownMenuItem asChild className="focus:bg-accent focus:text-accent-foreground cursor-pointer rounded-md">
                    <Link href="/admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-neon-orange" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-md">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 font-bold rounded-full px-6">
                Login
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-20 left-4 right-4 glass-card p-4 rounded-2xl pointer-events-auto md:hidden flex flex-col gap-2"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              <item.icon className="h-5 w-5 text-neon-green" />
              <span className="font-display font-bold">{item.label}</span>
            </Link>
          ))}
          <div className="flex items-center gap-2 p-3 border-t border-white/10 mt-2">
             <span className="text-sm font-medium text-muted-foreground">Theme</span>
             <ModeToggle />
          </div>
        </motion.div>
      )}

      {/* Search Command Dialog */}
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </nav>
  )
}
