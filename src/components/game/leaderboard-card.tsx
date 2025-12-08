'use client'

import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GuildBadge } from './guild-badge'
import { GUILDS } from '@/lib/constants'
import { cn, formatNumber } from '@/lib/utils'
import type { GuildLeaderboard, CollegeEnum } from '@/types'

interface LeaderboardCardProps {
  leaderboard: GuildLeaderboard[]
  userGuild?: CollegeEnum
  className?: string
}

export function LeaderboardCard({
  leaderboard,
  userGuild,
  className,
}: LeaderboardCardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Guild Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {leaderboard.map((guild, index) => {
            const guildInfo = GUILDS[guild.college]
            const isUserGuild = guild.college === userGuild

            return (
              <motion.div
                key={guild.college}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'flex items-center gap-4 p-4 transition-colors',
                  isUserGuild && 'bg-primary/5'
                )}
              >
                <div className="flex h-10 w-10 items-center justify-center text-xl font-bold">
                  {getRankIcon(guild.rank)}
                </div>

                <GuildBadge
                  college={guild.college}
                  size="sm"
                  showName={false}
                  animated={false}
                />

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
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {guild.totalMembers} members
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Avg. Lvl {guild.averageLevel.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-display text-lg font-bold text-amber-500">
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
  )
}






