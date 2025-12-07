'use client'

import { motion } from 'framer-motion'
import { Flame, Coins } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GuildBadge } from './guild-badge'
import { XpBar } from './xp-bar'
import { GUILDS } from '@/lib/constants'
import { cn, formatNumber } from '@/lib/utils'
import type { UserProfile } from '@/types'

interface PlayerCardProps {
  user: UserProfile
  showStats?: boolean
  className?: string
}

export function PlayerCard({
  user,
  showStats = true,
  className,
}: PlayerCardProps) {
  const guild = GUILDS[user.college]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden border-2',
          className
        )}
        style={{ borderColor: `${guild.color}60` }}
      >
        <div
          className="absolute inset-x-0 top-0 h-24 opacity-20"
          style={{
            background: `linear-gradient(180deg, ${guild.color} 0%, transparent 100%)`,
          }}
        />

        <CardContent className="relative pt-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4" style={{ borderColor: guild.color }}>
                <AvatarImage src={user.avatarUrl || undefined} />
                <AvatarFallback className="text-2xl font-bold">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg"
                style={{ backgroundColor: guild.color }}
              >
                {user.level}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="font-display text-xl font-bold">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-sm text-muted-foreground">{user.studentId}</p>
              <GuildBadge college={user.college} size="sm" className="mt-2" />
            </div>
          </div>

          {showStats && (
            <>
              <div className="mt-6">
                <XpBar currentXp={user.xp} level={user.level} />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-800/50 p-3">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="text-lg font-bold text-yellow-500">
                      {formatNumber(user.gold)}
                    </div>
                    <div className="text-xs text-muted-foreground">Gold</div>
                  </div>
                </div>

                <div className="h-8 w-px bg-border" />

                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="text-lg font-bold text-orange-500">
                      {user.activityStreak}
                    </div>
                    <div className="text-xs text-muted-foreground">Day Streak</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}




