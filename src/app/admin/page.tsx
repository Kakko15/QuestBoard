'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Shield,
  Users,
  Scroll,
  Trophy,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  PlusCircle,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { StatsOverview } from '@/components/game/stats-overview'
import { LeaderboardCard } from '@/components/game/leaderboard-card'
import { createClient } from '@/lib/supabase/client'
import { formatNumber } from '@/lib/utils'
import type { UserProfile, GuildLeaderboard } from '@/types'

const mockLeaderboard: GuildLeaderboard[] = [
  { college: 'CCSICT', guildName: 'The Technomancers', totalXp: 125000, totalMembers: 450, averageLevel: 12.5, rank: 1 },
  { college: 'COE', guildName: 'The Artificers', totalXp: 118000, totalMembers: 380, averageLevel: 11.8, rank: 2 },
  { college: 'CED', guildName: 'The Sages', totalXp: 112000, totalMembers: 520, averageLevel: 10.2, rank: 3 },
  { college: 'CBAPA', guildName: 'The Tycoons', totalXp: 98000, totalMembers: 410, averageLevel: 9.5, rank: 4 },
  { college: 'CON', guildName: 'The Vitalists', totalXp: 95000, totalMembers: 320, averageLevel: 11.2, rank: 5 },
]

interface AdminStats {
  totalUsers: number
  activeQuests: number
  questsCompleted: number
  atRiskStudents: number
}

export default function AdminPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats] = useState<AdminStats>({
    totalUsers: 3420,
    activeQuests: 24,
    questsCompleted: 15680,
    atRiskStudents: 45,
  })
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
        if (profile.role !== 'quest_giver' && profile.role !== 'game_master') {
          router.push('/')
          return
        }

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
          <Shield className="mx-auto h-12 w-12 text-purple-500" />
          <p className="mt-4 text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const adminStats = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5" />,
      color: '#3b82f6',
      trend: 12,
    },
    {
      label: 'Active Quests',
      value: stats.activeQuests,
      icon: <Scroll className="h-5 w-5" />,
      color: '#f59e0b',
      trend: 5,
    },
    {
      label: 'Quests Completed',
      value: stats.questsCompleted,
      icon: <Trophy className="h-5 w-5" />,
      color: '#22c55e',
      trend: 24,
    },
    {
      label: 'At-Risk Students',
      value: stats.atRiskStudents,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: '#ef4444',
      trend: -8,
    },
  ]

  return (
    <div className="min-h-screen">
      <Navbar user={user} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">
                  {user.role === 'game_master' ? 'Game Master' : 'Quest Giver'} Panel
                </h1>
                <p className="text-muted-foreground">
                  Manage quests, view analytics, and monitor student engagement
                </p>
              </div>
            </div>
            <Button variant="quest" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create Quest
            </Button>
          </div>
        </motion.div>

        <StatsOverview stats={adminStats} className="mb-8" />

        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="quests" className="gap-2">
              <Scroll className="h-4 w-4" />
              Quests
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            {user.role === 'game_master' && (
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              <LeaderboardCard leaderboard={mockLeaderboard} />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    At-Risk Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Students identified by the predictive model as having high
                    disengagement risk based on activity patterns.
                  </p>
                  <div className="space-y-3">
                    {[
                      { name: 'Student A', risk: 85, college: 'CCSICT', lastActive: '14 days ago' },
                      { name: 'Student B', risk: 78, college: 'COE', lastActive: '12 days ago' },
                      { name: 'Student C', risk: 72, college: 'CED', lastActive: '10 days ago' },
                    ].map((student, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.college} • {student.lastActive}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-500">{student.risk}%</div>
                          <div className="text-xs text-muted-foreground">Risk Score</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Engagement Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-3xl font-bold text-green-500">89%</div>
                      <div className="text-sm text-muted-foreground">
                        Quest Completion Rate
                      </div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-3xl font-bold text-blue-500">4.2</div>
                      <div className="text-sm text-muted-foreground">
                        Avg. Quests/Week/Student
                      </div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-3xl font-bold text-purple-500">72%</div>
                      <div className="text-sm text-muted-foreground">
                        Active Users (30d)
                      </div>
                    </div>
                    <div className="rounded-lg border p-4 text-center">
                      <div className="text-3xl font-bold text-amber-500">6.8</div>
                      <div className="text-sm text-muted-foreground">
                        Avg. Activity Streak
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quests">
            <Card>
              <CardHeader>
                <CardTitle>Quest Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Quest management features will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Data Mining Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border p-6">
                    <h3 className="mb-4 font-semibold">Student Clusters (K-Means)</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>The Grinders</span>
                        <span className="font-bold text-green-500">1,245</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>The Socializers</span>
                        <span className="font-bold text-blue-500">892</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>The Achievers</span>
                        <span className="font-bold text-purple-500">678</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>The Explorers</span>
                        <span className="font-bold text-amber-500">456</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>At-Risk</span>
                        <span className="font-bold text-red-500">149</span>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border p-6">
                    <h3 className="mb-4 font-semibold">Prediction Model (Random Forest)</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Model Accuracy</span>
                        <span className="font-bold text-green-500">94.2%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Precision</span>
                        <span className="font-bold">91.8%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Recall</span>
                        <span className="font-bold">89.5%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>F1 Score</span>
                        <span className="font-bold">90.6%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Last Trained</span>
                        <span className="text-muted-foreground">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {user.role === 'game_master' && (
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    System configuration options for Game Masters.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}






