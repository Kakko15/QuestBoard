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
  Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-7xl glass-card flex items-center justify-between rounded-2xl px-6 py-3 shadow-lg shadow-black/10">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-neon-purple text-white shadow-lg shadow-neon-purple/20 overflow-hidden"
            >
              <Image 
                src="/logo-symbol-only.png" 
                alt="QuestBoard Logo" 
                fill
                className="object-cover p-1"
              />
            </motion.div>
            <span className="font-display text-xl font-bold tracking-tight hidden md:block group-hover:text-neon-purple transition-colors">
              QUEST<span className="text-neon-green">BOARD</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex bg-secondary/50 rounded-full p-1 border border-border/50">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      'relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                      isActive 
                        ? 'text-primary-foreground bg-primary font-bold shadow-lg shadow-primary/20' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search quests, guilds, or players..." 
              className="w-full bg-secondary/50 border-border/50 rounded-full pl-10 focus:bg-background focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground rounded-full">
            <Bell className="h-5 w-5" />
          </Button>

          <div className="h-8 w-px bg-border mx-2 hidden md:block" />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 outline-none group"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-medium text-muted-foreground group-hover:text-neon-green transition-colors">Level {user.level}</div>
                    <div className="text-sm font-bold font-display truncate max-w-[100px]">{user.firstName}</div>
                  </div>
                  <Avatar className="h-10 w-10 border-2 border-white/10 group-hover:border-neon-green transition-colors">
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
        </motion.div>
      )}
    </nav>
  )
}

