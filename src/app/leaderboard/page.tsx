'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, TrendingUp, Users, Crown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { GuildBadge } from '@/components/game/guild-badge'
import { GUILDS } from '@/lib/constants'
import { cn, formatNumber } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, GuildLeaderboard, CollegeEnum } from '@/types'

const mockGuildLeaderboard: GuildLeaderboard[] = [
  { college: 'CCSICT', guildName: 'The Technomancers', totalXp: 125000, totalMembers: 450, averageLevel: 12.5, rank: 1 },
  { college: 'COE', guildName: 'The Artificers', totalXp: 118000, totalMembers: 380, averageLevel: 11.8, rank: 2 },
  { college: 'CED', guildName: 'The Sages', totalXp: 112000, totalMembers: 520, averageLevel: 10.2, rank: 3 },
  { college: 'CBAPA', guildName: 'The Tycoons', totalXp: 98000, totalMembers: 410, averageLevel: 9.5, rank: 4 },
  { college: 'CON', guildName: 'The Vitalists', totalXp: 95000, totalMembers: 320, averageLevel: 11.2, rank: 5 },
  { college: 'CA', guildName: 'The Druids', totalXp: 89000, totalMembers: 290, averageLevel: 9.8, rank: 6 },
  { college: 'CCJE', guildName: 'The Wardens', totalXp: 85000, totalMembers: 340, averageLevel: 8.9, rank: 7 },
  { college: 'CAS', guildName: 'The Alchemists', totalXp: 78000, totalMembers: 280, averageLevel: 9.1, rank: 8 },
  { college: 'IOF', guildName: 'The Tidemasters', totalXp: 72000, totalMembers: 180, averageLevel: 10.5, rank: 9 },
  { college: 'SVM', guildName: 'The Beastmasters', totalXp: 68000, totalMembers: 150, averageLevel: 11.0, rank: 10 },
  { college: 'COM', guildName: 'The Clerics', totalXp: 62000, totalMembers: 120, averageLevel: 12.8, rank: 11 },
]

interface PlayerRanking {
  rank: number
  id: string
  firstName: string
  lastName: string
  college: CollegeEnum
  level: number
  xp: number
  avatarUrl: string | null
}

const mockPlayerRankings: PlayerRanking[] = [
  { rank: 1, id: '1', firstName: 'Maria', lastName: 'Santos', college: 'CCSICT', level: 25, xp: 24500, avatarUrl: null },
  { rank: 2, id: '2', firstName: 'Juan', lastName: 'Dela Cruz', college: 'COE', level: 23, xp: 22800, avatarUrl: null },
  { rank: 3, id: '3', firstName: 'Ana', lastName: 'Reyes', college: 'CED', level: 22, xp: 21500, avatarUrl: null },
  { rank: 4, id: '4', firstName: 'Pedro', lastName: 'Garcia', college: 'CCSICT', level: 21, xp: 20200, avatarUrl: null },
  { rank: 5, id: '5', firstName: 'Sofia', lastName: 'Cruz', college: 'CON', level: 20, xp: 19800, avatarUrl: null },
  { rank: 6, id: '6', firstName: 'Miguel', lastName: 'Lopez', college: 'CBAPA', level: 19, xp: 18500, avatarUrl: null },
  { rank: 7, id: '7', firstName: 'Isabella', lastName: 'Torres', college: 'CA', level: 18, xp: 17200, avatarUrl: null },
  { rank: 8, id: '8', firstName: 'Carlos', lastName: 'Ramos', college: 'CCJE', level: 17, xp: 16800, avatarUrl: null },
  { rank: 9, id: '9', firstName: 'Lucia', lastName: 'Mendoza', college: 'CAS', level: 17, xp: 16500, avatarUrl: null },
  { rank: 10, id: '10', firstName: 'Diego', lastName: 'Flores', college: 'IOF', level: 16, xp: 15900, avatarUrl: null },
]

export default function LeaderboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [activeTab, setActiveTab] = useState('guilds')
  const supabase = createClient()

  useEffect(() => {
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
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: 'text-yellow-500' }
    if (rank === 2) return { icon: '🥈', color: 'text-gray-400' }
    if (rank === 3) return { icon: '🥉', color: 'text-amber-600' }
    return { icon: `#${rank}`, color: 'text-muted-foreground' }
  }

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
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
              <p className="text-muted-foreground">
                See how guilds and players rank across ISU-Echague
              </p>
            </div>
          </div>
        </motion.div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {mockGuildLeaderboard.slice(0, 3).map((guild, index) => {
            const guildInfo = GUILDS[guild.college]
            return (
              <motion.div
                key={guild.college}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={cn(
                    'relative overflow-hidden',
                    index === 0 && 'border-yellow-500/50',
                    index === 1 && 'border-gray-400/50',
                    index === 2 && 'border-amber-600/50'
                  )}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ backgroundColor: guildInfo.color }}
                  />
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="text-4xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </div>
                      {index === 0 && <Crown className="h-6 w-6 text-yellow-500" />}
                    </div>
                    <div className="mt-4">
                      <GuildBadge college={guild.college} size="md" />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total XP</span>
                      <span className="font-bold text-amber-500">
                        {formatNumber(guild.totalXp)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Members</span>
                      <span>{guild.totalMembers}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="guilds" className="gap-2">
              <Users className="h-4 w-4" />
              Guild Rankings
            </TabsTrigger>
            <TabsTrigger value="players" className="gap-2">
              <Medal className="h-4 w-4" />
              Top Players
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guilds">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  All Guild Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {mockGuildLeaderboard.map((guild, index) => {
                    const guildInfo = GUILDS[guild.college]
                    const isUserGuild = guild.college === user?.college

                    return (
                      <motion.div
                        key={guild.college}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          'flex items-center gap-4 p-4 transition-colors hover:bg-muted/50',
                          isUserGuild && 'bg-primary/5'
                        )}
                      >
                        <div className="flex h-10 w-10 items-center justify-center text-xl font-bold">
                          {getRankDisplay(guild.rank).icon}
                        </div>

                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                          style={{ backgroundColor: guildInfo.color }}
                        >
                          {guildInfo.icon}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="font-bold"
                              style={{ color: guildInfo.color }}
                            >
                              {guildInfo.guildName}
                            </span>
                            {isUserGuild && (
                              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-xs text-primary">
                                Your Guild
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {guildInfo.officialName}
                          </div>
                        </div>

                        <div className="hidden items-center gap-6 sm:flex">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              Members
                            </div>
                            <div className="font-bold">{guild.totalMembers}</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <TrendingUp className="h-3 w-3" />
                              Avg Level
                            </div>
                            <div className="font-bold">{guild.averageLevel.toFixed(1)}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-display text-xl font-bold text-amber-500">
                            {formatNumber(guild.totalXp)}
                          </div>
                          <div className="text-xs text-muted-foreground">Total XP</div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="players">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal className="h-5 w-5 text-amber-500" />
                  Top Players
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {mockPlayerRankings.map((player, index) => {
                    const guildInfo = GUILDS[player.college]
                    const rankDisplay = getRankDisplay(player.rank)

                    return (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                      >
                        <div
                          className={cn(
                            'flex h-10 w-10 items-center justify-center text-xl font-bold',
                            rankDisplay.color
                          )}
                        >
                          {rankDisplay.icon}
                        </div>

                        <Avatar className="h-10 w-10 border-2" style={{ borderColor: guildInfo.color }}>
                          <AvatarImage src={player.avatarUrl || undefined} />
                          <AvatarFallback>
                            {player.firstName[0]}
                            {player.lastName[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="font-bold">
                            {player.firstName} {player.lastName}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span style={{ color: guildInfo.color }}>
                              {guildInfo.guildName}
                            </span>
                            <span>•</span>
                            <span>Level {player.level}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="font-display text-xl font-bold text-amber-500">
                            {formatNumber(player.xp)}
                          </div>
                          <div className="text-xs text-muted-foreground">XP</div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}




