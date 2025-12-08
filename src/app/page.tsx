'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Trophy,
  ChevronRight,
  Gamepad2,
  Play,
  Globe,
  Flag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { PlayerCard } from '@/components/game/player-card'
import { QuestCard } from '@/components/game/quest-card'
import { LeaderboardCard } from '@/components/game/leaderboard-card'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, Quest, GuildLeaderboard } from '@/types'

// Mock data continues...
const mockQuests: Quest[] = [
  {
    id: '1',
    title: 'Campus Clean-Up Drive',
    description: 'Join the environmental club in cleaning the campus grounds.',
    shortDescription: 'Help keep our campus clean and earn rewards!',
    difficulty: 'common',
    xpReward: 150,
    goldReward: 50,
    requirements: { type: 'gps', latitude: 16.7056, longitude: 121.6453, radiusMeters: 100 },
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    maxParticipants: 50,
    currentParticipants: 23,
    createdById: 'system',
    targetColleges: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const mockLeaderboard: GuildLeaderboard[] = [
  { college: 'CCSICT', guildName: 'The Technomancers', totalXp: 125000, totalMembers: 450, averageLevel: 12.5, rank: 1 },
  { college: 'COE', guildName: 'The Artificers', totalXp: 118000, totalMembers: 380, averageLevel: 11.8, rank: 2 },
  { college: 'CED', guildName: 'The Sages', totalXp: 112000, totalMembers: 520, averageLevel: 10.2, rank: 3 },
  { college: 'CBAPA', guildName: 'The Tycoons', totalXp: 98000, totalMembers: 410, averageLevel: 9.5, rank: 4 },
  { college: 'CON', guildName: 'The Vitalists', totalXp: 95000, totalMembers: 320, averageLevel: 11.2, rank: 5 },
]

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showLoader, setShowLoader] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    
    const hasVisited = localStorage.getItem('questboard_welcomed')
    const hasSeenLoader = sessionStorage.getItem('questboard_loaded')
    
    if (!hasVisited) {
      router.replace('/welcome')
      return
    }

    if (hasSeenLoader) {
      setShowLoader(false)
    } else {
      const loaderTimer = setTimeout(() => {
        setShowLoader(false)
        sessionStorage.setItem('questboard_loaded', 'true')
      }, 1500)
      
      return () => clearTimeout(loaderTimer)
    }

    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            studentId: profile.student_id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            college: profile.college,
            role: profile.role,
            xp: profile.xp,
            gold: profile.gold,
            level: profile.level,
            avatarUrl: profile.avatar_url,
            activityStreak: profile.activity_streak,
            lastActiveAt: profile.last_active_at,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
          })
        }
      }
    }

    fetchUser()
  }, [supabase, router])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (showLoader) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-300">
      <Navbar user={user} onSignOut={async () => { await supabase.auth.signOut(); setUser(null); }} />

      <main>
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-neon-purple/20 dark:bg-neon-purple/20 rounded-full blur-[80px] md:blur-[100px] animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-neon-green/20 dark:bg-neon-green/20 rounded-full blur-[80px] md:blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6 md:mb-8 flex justify-center gap-4 text-neon-green"
            >
              <Globe className="w-5 h-5 md:w-6 md:h-6" />
              <div className="w-5 h-5 md:w-6 md:h-6 bg-neon-green/20 pixel-corners" />
              <Flag className="w-5 h-5 md:w-6 md:h-6" />
            </motion.div>

            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground to-muted-foreground drop-shadow-2xl leading-tight"
            >
              QUESTBOARD
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-4 md:mt-6 text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto font-light px-4"
            >
              Your 2025 Campus Adventure Starts Here
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 md:mt-12"
            >
              {user ? (
                <Link href="/quests">
                  <Button className="bg-neon-green text-black dark:text-black text-base md:text-lg font-bold px-6 py-5 md:px-8 md:py-6 rounded-none pixel-corners hover:bg-neon-green/80 hover:scale-105 transition-all shadow-lg shadow-neon-green/20">
                    <Play className="mr-2 w-4 h-4 md:w-5 md:h-5 fill-current" />
                    CONTINUE
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register">
                  <Button className="bg-neon-green text-black dark:text-black text-base md:text-lg font-bold px-6 py-5 md:px-8 md:py-6 rounded-none pixel-corners hover:bg-neon-green/80 hover:scale-105 transition-all shadow-lg shadow-neon-green/20">
                    <Play className="mr-2 w-4 h-4 md:w-5 md:h-5 fill-current" />
                    START
                  </Button>
                </Link>
              )}
            </motion.div>

            {/* Floating 3D Elements - Static positioned, CSS animated */}
            <div className="absolute top-20 left-4 lg:left-10 hidden lg:block animate-float">
              <div className="w-24 h-24 bg-neon-orange/10 dark:bg-neon-orange/20 border border-neon-orange/50 dark:border-neon-orange backdrop-blur-sm pixel-corners flex items-center justify-center shadow-xl">
                <Trophy className="w-10 h-10 text-neon-orange" />
              </div>
            </div>
            <div className="absolute bottom-20 right-4 lg:right-10 hidden lg:block animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="w-32 h-32 bg-neon-purple/10 dark:bg-neon-purple/20 border border-neon-purple/50 dark:border-neon-purple backdrop-blur-sm pixel-corners flex items-center justify-center shadow-xl">
                <Gamepad2 className="w-12 h-12 text-neon-purple" />
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-12 md:py-20 bg-secondary/30 dark:bg-black/50 relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-neon-purple font-pixel text-5xl md:text-6xl mb-2">3,420</div>
                <div className="text-muted-foreground uppercase tracking-widest text-xs md:text-sm">Players Active</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="text-neon-green font-pixel text-5xl md:text-6xl mb-2">156k</div>
                <div className="text-muted-foreground uppercase tracking-widest text-xs md:text-sm">Quests Completed</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-neon-orange font-pixel text-5xl md:text-6xl mb-2">11</div>
                <div className="text-muted-foreground uppercase tracking-widest text-xs md:text-sm">Guilds Competing</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* USER PROFILE OR CTA */}
        {user ? (
          <section className="py-16 md:py-20 container mx-auto px-4">
            <div className="grid gap-8 lg:grid-cols-2 items-start">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6 md:mb-8">
                  YOUR <span className="text-neon-purple">SQUAD</span>
                </h2>
                <PlayerCard user={user} className="glass-card border-none" />
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-between items-end mb-6 md:mb-8">
                  <h2 className="font-display text-3xl md:text-4xl font-bold">
                    ACTIVE <span className="text-neon-orange">QUESTS</span>
                  </h2>
                  <Link href="/quests" className="text-neon-green hover:underline flex items-center gap-1 text-sm md:text-base">
                    VIEW ALL <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-6">
                  {mockQuests.slice(0, 2).map((quest) => (
                    <QuestCard key={quest.id} quest={quest} className="glass-card border-border/50 hover:border-neon-orange/50 transition-all" />
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        ) : null}

        {/* LEADERBOARD TEASER */}
        <section className="py-20 md:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-neon-purple/5 skew-y-3 transform origin-top-left scale-110" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">GUILD RANKINGS</h2>
              <p className="text-muted-foreground">Who will claim the throne this semester?</p>
            </motion.div>

            <LeaderboardCard
              leaderboard={mockLeaderboard}
              userGuild={user?.college}
              className="max-w-4xl mx-auto glass-card border-border/50"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
