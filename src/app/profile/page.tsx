'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  User,
  Target,
  Trophy,
  Calendar,
  Sparkles,
  Award,
  Loader2,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PlayerCard } from '@/components/game/player-card'
import { StatsOverview } from '@/components/game/stats-overview'
import { useUser } from '@/hooks/use-user'
import { useAchievements, useQuestHistory, useUserStats } from '@/hooks/use-profile'
import { formatDate, formatNumber } from '@/lib/utils'
import { DIFFICULTY_CONFIG } from '@/lib/constants'

// Default achievement icons for seeded achievements
const ACHIEVEMENT_ICONS: Record<string, string> = {
  'First Steps': '🎯',
  'Early Bird': '🌅',
  'Team Player': '🤝',
  'Dedicated': '🔥',
  'Scholar': '📚',
  'Community Hero': '💪',
  'Guild Champion': '🏆',
  'Quest Master': '⚔️',
  'Gold Collector': '💰',
  'Rising Star': '⭐',
}

export default function ProfilePage() {
  const { user, loading: userLoading, signOut } = useUser()
  const { achievements, unlockedCount, loading: achievementsLoading, refresh: refreshAchievements } = useAchievements()
  const { history, stats: historyStats, loading: historyLoading, refresh: refreshHistory } = useQuestHistory()
  const { stats, loading: statsLoading, refresh: refreshStats } = useUserStats()
  const router = useRouter()

  // Redirect to login if not authenticated
  if (!userLoading && !user) {
    router.push('/auth/login')
    return null
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-neon-purple" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const profileStats = [
    {
      label: 'XP',
      value: stats?.xp ?? user.xp,
      icon: <Sparkles className="h-5 w-5" />,
      color: '#a855f7',
    },
    {
      label: 'Gold',
      value: stats?.gold ?? user.gold,
      icon: <Target className="h-5 w-5" />,
      color: '#f59e0b',
    },
    {
      label: 'Level',
      value: stats?.level ?? user.level,
      icon: <Trophy className="h-5 w-5" />,
      color: '#22c55e',
    },
    {
      label: 'Streak',
      value: stats?.activityStreak ?? user.activityStreak,
      icon: <Award className="h-5 w-5" />,
      color: '#ef4444',
      suffix: ' days',
    },
    {
      label: 'Quests Done',
      value: stats?.questsCompleted ?? historyStats.completedQuests,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: '#3b82f6',
    },
    {
      label: 'Guild Rank',
      value: stats?.guildRank ?? 0,
      icon: <User className="h-5 w-5" />,
      color: '#06b6d4',
      prefix: '#',
    },
  ]

  const handleRefreshAll = () => {
    refreshAchievements()
    refreshHistory()
    refreshStats()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar user={user} onSignOut={signOut} />

      <main className="container mx-auto px-4 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-neon-purple to-indigo-600">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">My Profile</h1>
                <p className="text-muted-foreground">
                  View your stats, achievements, and progress
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshAll}
              disabled={achievementsLoading || historyLoading || statsLoading}
            >
              {(achievementsLoading || historyLoading || statsLoading) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <PlayerCard user={user} />

            <Card className="mt-4 glass-card">
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
            <StatsOverview stats={profileStats} className="mb-8" />

            <Tabs defaultValue="achievements">
              <TabsList className="mb-4">
                <TabsTrigger value="achievements" className="gap-2 data-[state=active]:bg-neon-orange data-[state=active]:text-black">
                  <Award className="h-4 w-4" />
                  Achievements ({unlockedCount}/{achievements.length || '...'})
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-neon-purple data-[state=active]:text-white">
                  <Calendar className="h-4 w-4" />
                  Quest History ({historyStats.completedQuests})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="achievements">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-neon-orange" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {achievementsLoading ? (
                      <div className="py-12 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-neon-orange" />
                        <p className="mt-4 text-muted-foreground">Loading achievements...</p>
                      </div>
                    ) : achievements.length > 0 ? (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {achievements.map((achievement, index) => (
                          <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`flex items-center gap-3 rounded-lg border p-4 ${
                              achievement.unlockedAt
                                ? 'bg-neon-orange/5 border-neon-orange/30'
                                : 'opacity-50 border-border'
                            }`}
                          >
                            <div
                              className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                                achievement.unlockedAt
                                  ? 'bg-neon-orange/20'
                                  : 'bg-secondary'
                              }`}
                            >
                              {ACHIEVEMENT_ICONS[achievement.name] || '🏅'}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold">{achievement.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {achievement.description}
                              </div>
                              {achievement.unlockedAt && (
                                <div className="mt-1 text-xs text-neon-orange">
                                  Unlocked {formatDate(achievement.unlockedAt)}
                                </div>
                              )}
                            </div>
                            {achievement.xpBonus > 0 && achievement.unlockedAt && (
                              <Badge className="bg-neon-purple/20 text-neon-purple border-none">
                                +{achievement.xpBonus} XP
                              </Badge>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <Trophy className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No achievements yet</h3>
                        <p className="text-muted-foreground">
                          Complete quests to unlock achievements
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-neon-purple" />
                      Quest History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {historyLoading ? (
                      <div className="py-12 text-center">
                        <Loader2 className="mx-auto h-8 w-8 animate-spin text-neon-purple" />
                        <p className="mt-4 text-muted-foreground">Loading history...</p>
                      </div>
                    ) : history.length > 0 ? (
                      <div className="space-y-3">
                        {history.map((item, index) => {
                          const difficultyConfig = item.quest?.difficulty 
                            ? DIFFICULTY_CONFIG[item.quest.difficulty as keyof typeof DIFFICULTY_CONFIG]
                            : null

                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border"
                            >
                              <div className={`p-2 rounded-lg ${
                                item.status === 'completed' 
                                  ? 'bg-neon-green/20' 
                                  : 'bg-neon-orange/20'
                              }`}>
                                {item.status === 'completed' ? (
                                  <CheckCircle2 className="h-5 w-5 text-neon-green" />
                                ) : (
                                  <Clock className="h-5 w-5 text-neon-orange" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold truncate">
                                    {item.quest?.title || 'Unknown Quest'}
                                  </span>
                                  {difficultyConfig && (
                                    <Badge 
                                      className="text-xs"
                                      style={{ 
                                        backgroundColor: `${difficultyConfig.color}20`,
                                        color: difficultyConfig.color 
                                      }}
                                    >
                                      {difficultyConfig.label}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {item.status === 'completed' && item.completedAt
                                    ? `Completed ${formatDate(item.completedAt)}`
                                    : `Started ${formatDate(item.startedAt)}`
                                  }
                                </div>
                              </div>
                              {item.status === 'completed' && (
                                <div className="text-right">
                                  <div className="text-sm font-bold text-neon-purple">
                                    +{formatNumber(item.xpAwarded)} XP
                                  </div>
                                  <div className="text-sm font-bold text-neon-orange">
                                    +{formatNumber(item.goldAwarded)} G
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <Target className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No quest history yet</h3>
                        <p className="text-muted-foreground">
                          Complete quests to see them here
                        </p>
                      </div>
                    )}
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
