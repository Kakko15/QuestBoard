'use client'

import { motion } from 'framer-motion'
import { calculateXpProgress, calculateXpForNextLevel, XP_PER_LEVEL } from '@/lib/constants'
import { cn, formatNumber } from '@/lib/utils'

interface XpBarProps {
  currentXp: number
  level: number
  showNumbers?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function XpBar({
  currentXp,
  level,
  showNumbers = true,
  size = 'md',
  className,
}: XpBarProps) {
  const progress = calculateXpProgress(currentXp) * 100
  const xpToNext = calculateXpForNextLevel(currentXp)
  const currentLevelXp = currentXp % XP_PER_LEVEL

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  }

  return (
    <div className={cn('w-full', className)}>
      {showNumbers && (
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="font-bold text-amber-500">Level {level}</span>
          <span className="text-muted-foreground">
            {formatNumber(currentLevelXp)} / {formatNumber(XP_PER_LEVEL)} XP
          </span>
        </div>
      )}
      <div
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-slate-800',
          sizeClasses[size]
        )}
      >
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-pulse" />
      </div>
      {showNumbers && (
        <div className="mt-1 text-right text-xs text-muted-foreground">
          {formatNumber(xpToNext)} XP to Level {level + 1}
        </div>
      )}
    </div>
  )
}




