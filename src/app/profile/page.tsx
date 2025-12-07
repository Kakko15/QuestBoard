'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Target,
  Trophy,
  Calendar,
  Sparkles,
  Coins,
  Flame,
  Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PlayerCard } from '@/components/game/player-card'
import { XpBar } from '@/components/game/xp-bar'
import { GuildBadge } from '@/components/game/guild-badge'
import { StatsOverview, createDefaultStats } from '@/components/game/stats-overview'
import { createClient } from '@/lib/supabase/client'
import { formatDate } from '@/lib/utils'
import type { UserProfile } from '@/types'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: string | null
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Complete your first quest',
    icon: '🎯',
    unlockedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Early Bird',
    description: 'Complete a quest before 8 AM',
    icon: '🌅',
    unlockedAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'Team Player',
    description: 'Participate in a guild event',
    icon: '🤝',
    unlockedAt: null,
  },
  {
    id: '4',
    name: 'Dedicated',
    description: 'Maintain a 7-day activity streak',
    icon: '🔥',
    unlockedAt: null,
  },
  {
    id: '5',
    name: 'Scholar',
    description: 'Complete 10 academic-related quests',
    icon: '📚',
    unlockedAt: null,
  },
  {
    id: '6',
    name: 'Community Hero',
    description: 'Complete 5 community service quests',
    icon: '💪',
    unlockedAt: null,
  },
]

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/auth/login')
        return
      }

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
      setLoading(false)
    }

    fetchUser()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-center">
          <Sparkles className="mx-auto h-12 w-12 text-amber-500" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const stats = createDefaultStats({
    xp: user.xp,
    gold: user.gold,
    level: user.level,
    activityStreak: user.activityStreak,
    questsCompleted: 12,
    guildRank: 45,
  })

  return (
    <div className="min-h-screen">
      <Navbar user={user} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">My Profile</h1>
              <p className="text-muted-foreground">
                View your stats, achievements, and progress
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <PlayerCard user={user} />

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Student ID</span>
                  <span>{user.studentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member Since</span>
                  <span>{formatDate(user.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <StatsOverview stats={stats} className="mb-8" />

            <Tabs defaultValue="achievements">
              <TabsList className="mb-4">
                <TabsTrigger value="achievements" className="gap-2">
                  <Award className="h-4 w-4" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Quest History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="achievements">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {mockAchievements.map((achievement, index) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className={`flex items-center gap-3 rounded-lg border p-4 ${
                            achievement.unlockedAt
                              ? 'bg-amber-500/5 border-amber-500/30'
                              : 'opacity-50'
                          }`}
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                              achievement.unlockedAt
                                ? 'bg-amber-500/20'
                                : 'bg-muted'
                            }`}
                          >
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold">{achievement.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {achievement.description}
                            </div>
                            {achievement.unlockedAt && (
                              <div className="mt-1 text-xs text-amber-500">
                                Unlocked {formatDate(achievement.unlockedAt)}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-amber-500" />
                      Quest History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="py-12 text-center text-muted-foreground">
                      <Target className="mx-auto h-12 w-12 opacity-50" />
                      <p className="mt-4">No completed quests yet</p>
                      <p className="text-sm">
                        Complete quests to see your history here
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}




