'use client'

import { motion } from 'framer-motion'
import { Trophy, Medal, TrendingUp, Users, Crown, Loader2, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { GuildBadge } from '@/components/game/guild-badge'
import { GUILDS } from '@/lib/constants'
import { cn, formatNumber } from '@/lib/utils'
import { useUser } from '@/hooks/use-user'
import { useLeaderboard } from '@/hooks/use-leaderboard'
import type { CollegeEnum } from '@/types'

export default function LeaderboardPage() {
  const { user, signOut } = useUser()
  const { guildLeaderboard, playerRankings, loading, error, refresh } = useLeaderboard()

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: 'text-yellow-500' }
    if (rank === 2) return { icon: '🥈', color: 'text-gray-400' }
    if (rank === 3) return { icon: '🥉', color: 'text-amber-600' }
    return { icon: `#${rank}`, color: 'text-muted-foreground' }
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
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
                <p className="text-muted-foreground">
                  See how guilds and players rank across ISU-Echague
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refresh()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </motion.div>

        {/* Top 3 Guilds Podium */}
        {!loading && guildLeaderboard.length > 0 && (
          <div className="mb-8 grid gap-4 md:grid-cols-3">
            {guildLeaderboard.slice(0, 3).map((guild, index) => {
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
                      'relative overflow-hidden glass-card',
                      index === 0 && 'border-yellow-500/50 ring-1 ring-yellow-500/30',
                      index === 1 && 'border-gray-400/50',
                      index === 2 && 'border-amber-600/50'
                    )}
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1"
                      style={{ backgroundColor: guildInfo?.color }}
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
                        <span className="font-bold text-neon-orange">
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
        )}

        {loading && (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-neon-purple" />
            <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
          </div>
        )}

        {!loading && (
          <Tabs defaultValue="guilds">
            <TabsList className="mb-6">
              <TabsTrigger value="guilds" className="gap-2 data-[state=active]:bg-neon-purple data-[state=active]:text-white">
                <Users className="h-4 w-4" />
                Guild Rankings
              </TabsTrigger>
              <TabsTrigger value="players" className="gap-2 data-[state=active]:bg-neon-green data-[state=active]:text-black">
                <Medal className="h-4 w-4" />
                Top Players
              </TabsTrigger>
            </TabsList>

            <TabsContent value="guilds">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-neon-orange" />
                    All Guild Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {guildLeaderboard.length > 0 ? (
                    <div className="divide-y divide-border">
                      {guildLeaderboard.map((guild, index) => {
                        const guildInfo = GUILDS[guild.college]
                        const isUserGuild = guild.college === user?.college

                        return (
                          <motion.div
                            key={guild.college}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              'flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50',
                              isUserGuild && 'bg-neon-purple/10'
                            )}
                          >
                            <div className="flex h-10 w-10 items-center justify-center text-xl font-bold">
                              {getRankDisplay(guild.rank).icon}
                            </div>

                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-full text-xl"
                              style={{ backgroundColor: guildInfo?.color }}
                            >
                              {guildInfo?.icon}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className="font-bold"
                                  style={{ color: guildInfo?.color }}
                                >
                                  {guildInfo?.guildName || guild.college}
                                </span>
                                {isUserGuild && (
                                  <span className="rounded bg-neon-purple/20 px-1.5 py-0.5 text-xs text-neon-purple">
                                    Your Guild
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {guildInfo?.acronym || guild.college}
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
                              <div className="font-display text-xl font-bold text-neon-orange">
                                {formatNumber(guild.totalXp)}
                              </div>
                              <div className="text-xs text-muted-foreground">Total XP</div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-semibold">No data yet</h3>
                      <p className="text-muted-foreground">Rankings will appear once players join</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="players">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Medal className="h-5 w-5 text-neon-green" />
                    Top Players
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {playerRankings.length > 0 ? (
                    <div className="divide-y divide-border">
                      {playerRankings.map((player, index) => {
                        const guildInfo = GUILDS[player.college as CollegeEnum]
                        const rankDisplay = getRankDisplay(player.rank)
                        const isCurrentUser = player.id === user?.id

                        return (
                          <motion.div
                            key={player.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={cn(
                              'flex items-center gap-4 p-4 transition-colors hover:bg-secondary/50',
                              isCurrentUser && 'bg-neon-green/10'
                            )}
                          >
                            <div
                              className={cn(
                                'flex h-10 w-10 items-center justify-center text-xl font-bold',
                                rankDisplay.color
                              )}
                            >
                              {rankDisplay.icon}
                            </div>

                            <Avatar className="h-10 w-10 border-2" style={{ borderColor: guildInfo?.color }}>
                              <AvatarImage src={player.avatarUrl || undefined} />
                              <AvatarFallback className="bg-secondary">
                                {player.firstName[0]}
                                {player.lastName[0]}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold">
                                  {player.firstName} {player.lastName}
                                </span>
                                {isCurrentUser && (
                                  <span className="rounded bg-neon-green/20 px-1.5 py-0.5 text-xs text-neon-green">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span style={{ color: guildInfo?.color }}>
                                  {guildInfo?.guildName || player.college}
                                </span>
                                <span>•</span>
                                <span>Level {player.level}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-display text-xl font-bold text-neon-green">
                                {formatNumber(player.xp)}
                              </div>
                              <div className="text-xs text-muted-foreground">XP</div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <Medal className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-4 text-lg font-semibold">No players yet</h3>
                      <p className="text-muted-foreground">Be the first to earn XP!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Footer />
    </div>
  )
}
