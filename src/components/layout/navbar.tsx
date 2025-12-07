'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
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
  Gamepad2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 pointer-events-none">
      <div className="pointer-events-auto glass-card flex items-center gap-8 rounded-full px-8 py-3 shadow-2xl shadow-black/50">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-purple text-white shadow-lg shadow-neon-purple/50"
          >
            <Gamepad2 className="h-6 w-6" />
          </motion.div>
          <span className="font-display text-xl font-bold tracking-tight hidden md:block group-hover:text-neon-purple transition-colors">
            QUEST<span className="text-neon-green">BOARD</span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'relative p-2 text-muted-foreground hover:text-white transition-colors',
                    isActive && 'text-neon-green'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 rounded-full bg-neon-green/20 blur-md"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 outline-none"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold font-pixel text-neon-orange">LVL {user.level}</div>
                    <div className="text-sm font-bold font-display truncate max-w-[100px]">{user.firstName}</div>
                  </div>
                  <Avatar className="h-10 w-10 border-2 border-neon-purple ring-2 ring-neon-purple/30">
                    <AvatarImage src={user.avatarUrl || undefined} />
                    <AvatarFallback className="bg-neon-purple text-white font-bold">
                      {user.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 glass-card border-white/10 text-white p-2">
                <div className="flex items-center gap-3 p-2 mb-2 bg-white/5 rounded-lg">
                  <GuildBadge college={user.college} size="sm" />
                  <div>
                    <div className="text-xs text-muted-foreground">Current Guild</div>
                    <div className="font-bold text-sm">{user.college}</div>
                  </div>
                </div>
                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer rounded-md">
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4 text-neon-blue" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer rounded-md">
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-neon-pink" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {(user.role === 'quest_giver' || user.role === 'game_master') && (
                  <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white cursor-pointer rounded-md">
                    <Link href="/admin" className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-neon-orange" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={onSignOut} className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer rounded-md">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" className="bg-neon-green text-black hover:bg-neon-green/80 font-bold font-display tracking-wider pixel-corners">
                LOGIN
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white"
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

