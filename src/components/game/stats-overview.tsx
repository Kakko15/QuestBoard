'use client'

import { motion } from 'framer-motion'
import { Sparkles, Coins, Target, Flame, Trophy, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn, formatNumber } from '@/lib/utils'

interface StatItem {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  trend?: number
}

interface StatsOverviewProps {
  stats: StatItem[]
  className?: string
}

export function StatsOverview({ stats, className }: StatsOverviewProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                </div>
                {stat.trend !== undefined && (
                  <div
                    className={cn(
                      'flex items-center gap-1 text-xs',
                      stat.trend >= 0 ? 'text-green-500' : 'text-red-500'
                    )}
                  >
                    <TrendingUp
                      className={cn('h-3 w-3', stat.trend < 0 && 'rotate-180')}
                    />
                    {Math.abs(stat.trend)}%
                  </div>
                )}
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold" style={{ color: stat.color }}>
                  {typeof stat.value === 'number'
                    ? formatNumber(stat.value)
                    : stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export function createDefaultStats(user: {
  xp: number
  gold: number
  level: number
  activityStreak: number
  questsCompleted?: number
  guildRank?: number
}): StatItem[] {
  return [
    {
      label: 'Total XP',
      value: user.xp,
      icon: <Sparkles className="h-5 w-5" />,
      color: '#f59e0b',
    },
    {
      label: 'Gold Earned',
      value: user.gold,
      icon: <Coins className="h-5 w-5" />,
      color: '#eab308',
    },
    {
      label: 'Current Level',
      value: user.level,
      icon: <Trophy className="h-5 w-5" />,
      color: '#a855f7',
    },
    {
      label: 'Day Streak',
      value: user.activityStreak,
      icon: <Flame className="h-5 w-5" />,
      color: '#f97316',
    },
    {
      label: 'Quests Completed',
      value: user.questsCompleted || 0,
      icon: <Target className="h-5 w-5" />,
      color: '#22c55e',
    },
    {
      label: 'Guild Rank',
      value: user.guildRank ? `#${user.guildRank}` : '-',
      icon: <Trophy className="h-5 w-5" />,
      color: '#3b82f6',
    },
  ]
}







