'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  Scroll,
  Trophy,
  Users,
  Sparkles,
  ChevronRight,
  Gamepad2,
  Shield,
  Play,
  Globe,
  Flag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { LoadingScreen } from '@/components/ui/loading-screen'
import { PlayerCard } from '@/components/game/player-card'
import { QuestCard } from '@/components/game/quest-card'
import { LeaderboardCard } from '@/components/game/leaderboard-card'
import { GuildBadge } from '@/components/game/guild-badge'
import { GUILDS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, Quest, GuildLeaderboard, CollegeEnum } from '@/types'

// ... (Previous mock data remains the same, I'll re-include it briefly for context)
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
  // ... other quests
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
  const [loading, setLoading] = useState(true)
  const [showLoader, setShowLoader] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 200])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])

  useEffect(() => {
    const hasVisited = localStorage.getItem('questboard_welcomed')
    if (!hasVisited) {
      router.push('/welcome')
      return
    }

    const loaderTimer = setTimeout(() => {
      setShowLoader(false)
    }, 2000)

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
      setLoading(false)
    }

    fetchUser()

    return () => clearTimeout(loaderTimer)
  }, [supabase, router])

  if (showLoader) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="scanline" />
      <Navbar user={user} onSignOut={async () => { await supabase.auth.signOut(); setUser(null); }} />

      <main>
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[100px] animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-green/20 rounded-full blur-[100px] animate-pulse-glow delay-1000" />
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 flex justify-center gap-4 text-neon-green"
            >
              <Globe className="w-6 h-6" />
              <div className="w-6 h-6 bg-neon-green/20 pixel-corners" />
              <Flag className="w-6 h-6" />
            </motion.div>

            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-display text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 drop-shadow-2xl"
            >
              QUESTBOARD
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light"
            >
              Your 2025 Campus Adventure Starts Here
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12"
            >
              {user ? (
                <Link href="/quests">
                  <Button className="bg-neon-green text-black text-lg font-bold px-8 py-6 rounded-none pixel-corners hover:bg-neon-green/80 hover:scale-105 transition-all">
                    <Play className="mr-2 w-5 h-5 fill-current" />
                    CONTINUE
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/register">
                  <Button className="bg-neon-green text-black text-lg font-bold px-8 py-6 rounded-none pixel-corners hover:bg-neon-green/80 hover:scale-105 transition-all">
                    <Play className="mr-2 w-5 h-5 fill-current" />
                    START
                  </Button>
                </Link>
              )}
            </motion.div>

            {/* Floating 3D Elements */}
            <motion.div style={{ y: y1 }} className="absolute top-20 left-10 hidden lg:block">
              <div className="w-24 h-24 bg-neon-orange/20 border border-neon-orange backdrop-blur-sm pixel-corners animate-float flex items-center justify-center">
                <Trophy className="w-10 h-10 text-neon-orange" />
              </div>
            </motion.div>
            <motion.div style={{ y: y2 }} className="absolute bottom-20 right-10 hidden lg:block">
              <div className="w-32 h-32 bg-neon-purple/20 border border-neon-purple backdrop-blur-sm pixel-corners animate-float flex items-center justify-center delay-700">
                <Gamepad2 className="w-12 h-12 text-neon-purple" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="py-20 bg-black/50 relative">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-neon-purple font-pixel text-6xl mb-2">3,420</div>
                <div className="text-gray-400 uppercase tracking-widest text-sm">Players Active</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <div className="text-neon-green font-pixel text-6xl mb-2">156k</div>
                <div className="text-gray-400 uppercase tracking-widest text-sm">Quests Completed</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-neon-orange font-pixel text-6xl mb-2">11</div>
                <div className="text-gray-400 uppercase tracking-widest text-sm">Guilds Competing</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* USER PROFILE OR CTA */}
        {user ? (
          <section className="py-20 container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-2 items-start">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-4xl font-bold mb-8">
                  YOUR <span className="text-neon-purple">SQUAD</span>
                </h2>
                <PlayerCard user={user} className="glass-card border-none" />
              </motion.div>

              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-between items-end mb-8">
                  <h2 className="font-display text-4xl font-bold">
                    ACTIVE <span className="text-neon-orange">QUESTS</span>
                  </h2>
                  <Link href="/quests" className="text-neon-green hover:underline flex items-center gap-1">
                    VIEW ALL <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-6">
                  {mockQuests.slice(0, 2).map((quest) => (
                    <QuestCard key={quest.id} quest={quest} className="bg-black/40 border-white/10 hover:border-neon-orange/50 transition-all" />
                  ))}
                </div>
              </motion.div>
            </div>
          </section>
        ) : null}

        {/* LEADERBOARD TEASER */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-neon-purple/5 skew-y-3 transform origin-top-left scale-110" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-5xl font-bold mb-4">GUILD RANKINGS</h2>
              <p className="text-gray-400">Who will claim the throne this semester?</p>
            </motion.div>

            <LeaderboardCard
              leaderboard={mockLeaderboard}
              userGuild={user?.college}
              className="max-w-4xl mx-auto glass-card border-white/10"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
