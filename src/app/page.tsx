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
  Loader2,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { StatsOverview } from '@/components/game/stats-overview'
import { LeaderboardCard } from '@/components/game/leaderboard-card'
import { QuestForm } from '@/components/admin/quest-form'
import { useUser } from '@/hooks/use-user'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import { createClient } from '@/lib/supabase/client'
import { formatNumber, formatDate } from '@/lib/utils'
import { DIFFICULTY_CONFIG } from '@/lib/constants'
import type { Quest } from '@/types'

interface AdminStats {
  totalUsers: number
  activeQuests: number
  questsCompleted: number
  atRiskStudents: number
}

interface PendingVerification {
  id: string
  userName: string
  questTitle: string
  submittedAt: string
  proofUrl: string | null
}

export default function AdminPage() {
  const { user, loading: userLoading, signOut } = useUser()
  const { guildLeaderboard, loading: leaderboardLoading, refresh: refreshLeaderboard } = useLeaderboard()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeQuests: 0,
    questsCompleted: 0,
    atRiskStudents: 0,
  })
  const [quests, setQuests] = useState<Quest[]>([])
  const [pendingVerifications, setPendingVerifications] = useState<PendingVerification[]>([])
  const [loading, setLoading] = useState(true)
  const [showQuestForm, setShowQuestForm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!user) return

      try {
        // Fetch stats
        const { count: usersCount } = await supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })

        const { count: activeQuestsCount } = await supabase
          .from('quests')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .gte('expires_at', new Date().toISOString())

        const { count: completedCount } = await supabase
          .from('user_quest_logs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'completed')

        // Fetch quests
        const { data: questsData } = await supabase
          .from('quests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20)

        // Fetch pending verifications (manual quests awaiting approval)
        const { data: pendingData } = await supabase
          .from('user_quest_logs')
          .select(`
            id,
            started_at,
            proof_url,
            user:user_profiles(first_name, last_name),
            quest:quests(title, requirements)
          `)
          .eq('status', 'in_progress')
          .not('proof_url', 'is', null)
          .limit(10)

        setStats({
          totalUsers: usersCount || 0,
          activeQuests: activeQuestsCount || 0,
          questsCompleted: completedCount || 0,
          atRiskStudents: 0, // Would come from data mining
        })

        if (questsData) {
          setQuests(questsData.map((q: any) => ({
            id: q.id,
            title: q.title,
            description: q.description,
            shortDescription: q.short_description,
            difficulty: q.difficulty,
            xpReward: q.xp_reward,
            goldReward: q.gold_reward,
            requirements: q.requirements,
            startsAt: q.starts_at,
            expiresAt: q.expires_at,
            maxParticipants: q.max_participants,
            currentParticipants: q.current_participants,
            createdById: q.created_by_id,
            targetColleges: q.target_colleges,
            isActive: q.is_active,
            createdAt: q.created_at,
            updatedAt: q.updated_at,
          })))
        }

        if (pendingData) {
          setPendingVerifications(pendingData.map((p: any) => ({
            id: p.id,
            userName: `${p.user?.first_name || ''} ${p.user?.last_name || ''}`.trim() || 'Unknown',
            questTitle: p.quest?.title || 'Unknown Quest',
            submittedAt: p.started_at,
            proofUrl: p.proof_url,
          })))
        }
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && (user.role === 'quest_giver' || user.role === 'game_master')) {
      fetchAdminData()
    }
  }, [user, supabase])

  // Redirect if not authorized
  useEffect(() => {
    if (!userLoading && user && user.role === 'player') {
      router.push('/')
    }
  }, [user, userLoading, router])

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-neon-purple" />
          <p className="mt-4 text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user || (user.role !== 'quest_giver' && user.role !== 'game_master')) {
    return null
  }

  const adminStats = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5" />,
      color: '#3b82f6',
    },
    {
      label: 'Active Quests',
      value: stats.activeQuests,
      icon: <Scroll className="h-5 w-5" />,
      color: '#f59e0b',
    },
    {
      label: 'Quests Completed',
      value: stats.questsCompleted,
      icon: <Trophy className="h-5 w-5" />,
      color: '#22c55e',
    },
    {
      label: 'Pending Reviews',
      value: pendingVerifications.length,
      icon: <Clock className="h-5 w-5" />,
      color: '#a855f7',
    },
  ]

  const handleApproveQuest = async (logId: string) => {
    // Implement quest approval
    try {
      // This would call an API to approve the quest
      setPendingVerifications((prev) => prev.filter((p) => p.id !== logId))
    } catch (error) {
      console.error('Error approving quest:', error)
    }
  }

  const handleRejectQuest = async (logId: string) => {
    // Implement quest rejection
    try {
      setPendingVerifications((prev) => prev.filter((p) => p.id !== logId))
    } catch (error) {
      console.error('Error rejecting quest:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar user={user} onSignOut={signOut} />

      <main className="container mx-auto px-4 pt-28 pb-20">
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
                <p className="text-gray-400">
                  Manage quests, view analytics, and monitor engagement
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowQuestForm(true)}
              className="bg-neon-green text-black hover:bg-neon-green/80 font-bold"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Quest
            </Button>
          </div>
        </motion.div>

        <StatsOverview stats={adminStats} className="mb-8" />

        <Tabs defaultValue="overview">
          <TabsList className="mb-6 bg-white/5 border border-white/10">
            <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-neon-purple data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="quests" className="gap-2 data-[state=active]:bg-neon-orange data-[state=active]:text-black">
              <Scroll className="h-4 w-4" />
              Quests ({quests.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-neon-green data-[state=active]:text-black">
              <Clock className="h-4 w-4" />
              Pending ({pendingVerifications.length})
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 data-[state=active]:bg-neon-blue data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 lg:grid-cols-2">
              <LeaderboardCard
                leaderboard={guildLeaderboard}
                userGuild={user.college}
                className="bg-black/40 border-white/10"
              />

              <Card className="bg-black/40 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Clock className="h-5 w-5 text-neon-orange" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {quests.slice(0, 5).map((quest, index) => (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                    >
                      <div>
                        <p className="font-medium text-white">{quest.title}</p>
                        <p className="text-xs text-gray-400">
                          Created {formatDate(quest.createdAt)}
                        </p>
                      </div>
                      <Badge
                        style={{
                          backgroundColor: `${DIFFICULTY_CONFIG[quest.difficulty].color}20`,
                          color: DIFFICULTY_CONFIG[quest.difficulty].color,
                        }}
                      >
                        {DIFFICULTY_CONFIG[quest.difficulty].label}
                      </Badge>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="quests">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center gap-2">
                    <Scroll className="h-5 w-5 text-neon-orange" />
                    Quest Management
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/10"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quests.length > 0 ? (
                  <div className="space-y-3">
                    {quests.map((quest, index) => {
                      const isExpired = new Date(quest.expiresAt) < new Date()
                      return (
                        <motion.div
                          key={quest.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white truncate">
                                {quest.title}
                              </span>
                              <Badge
                                className="text-xs"
                                style={{
                                  backgroundColor: `${DIFFICULTY_CONFIG[quest.difficulty].color}20`,
                                  color: DIFFICULTY_CONFIG[quest.difficulty].color,
                                }}
                              >
                                {DIFFICULTY_CONFIG[quest.difficulty].label}
                              </Badge>
                              {isExpired && (
                                <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                                  Expired
                                </Badge>
                              )}
                              {!quest.isActive && (
                                <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-400 truncate">
                              {quest.shortDescription}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                              <span>+{quest.xpReward} XP</span>
                              <span>+{quest.goldReward} Gold</span>
                              <span>{quest.currentParticipants} participants</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/10"
                          >
                            Edit
                          </Button>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Scroll className="mx-auto h-12 w-12 text-gray-600" />
                    <h3 className="mt-4 text-lg font-semibold">No quests yet</h3>
                    <p className="text-gray-500">Create your first quest to get started</p>
                    <Button
                      onClick={() => setShowQuestForm(true)}
                      className="mt-4 bg-neon-green text-black"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Quest
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="h-5 w-5 text-neon-green" />
                  Pending Verifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingVerifications.length > 0 ? (
                  <div className="space-y-3">
                    {pendingVerifications.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-white">{item.userName}</p>
                          <p className="text-sm text-gray-400">{item.questTitle}</p>
                          <p className="text-xs text-gray-500">
                            Submitted {formatDate(item.submittedAt)}
                          </p>
                        </div>
                        {item.proofUrl && (
                          <Button variant="outline" size="sm" className="border-white/10">
                            View Proof
                          </Button>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveQuest(item.id)}
                            className="bg-neon-green text-black hover:bg-neon-green/80"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectQuest(item.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-gray-600" />
                    <h3 className="mt-4 text-lg font-semibold">All caught up!</h3>
                    <p className="text-gray-500">No pending verifications</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="h-5 w-5 text-neon-blue" />
                  Data Mining Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-lg border border-white/10 p-6 bg-white/5">
                    <h3 className="mb-4 font-semibold text-white">Student Clusters (K-Means)</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'The Grinders', count: 1245, color: '#22c55e' },
                        { label: 'The Socializers', count: 892, color: '#3b82f6' },
                        { label: 'The Achievers', count: 678, color: '#a855f7' },
                        { label: 'The Explorers', count: 456, color: '#f59e0b' },
                        { label: 'At-Risk', count: 149, color: '#ef4444' },
                      ].map((cluster) => (
                        <div key={cluster.label} className="flex items-center justify-between">
                          <span className="text-gray-400">{cluster.label}</span>
                          <span className="font-bold" style={{ color: cluster.color }}>
                            {formatNumber(cluster.count)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 p-6 bg-white/5">
                    <h3 className="mb-4 font-semibold text-white">Prediction Model (Random Forest)</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Model Accuracy', value: '94.2%', color: '#22c55e' },
                        { label: 'Precision', value: '91.8%', color: '#3b82f6' },
                        { label: 'Recall', value: '89.5%', color: '#a855f7' },
                        { label: 'F1 Score', value: '90.6%', color: '#f59e0b' },
                      ].map((metric) => (
                        <div key={metric.label} className="flex items-center justify-between">
                          <span className="text-gray-400">{metric.label}</span>
                          <span className="font-bold" style={{ color: metric.color }}>
                            {metric.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Quest Creation Modal */}
      <QuestForm
        open={showQuestForm}
        onOpenChange={setShowQuestForm}
        onSuccess={() => {
          // Refresh quests
          window.location.reload()
        }}
      />
    </div>
  )
}