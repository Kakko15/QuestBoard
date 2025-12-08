'use client'

import { motion } from 'framer-motion'
import { GUILDS } from '@/lib/constants'
import type { CollegeEnum } from '@/types'
import { cn } from '@/lib/utils'

interface GuildBadgeProps {
  college: CollegeEnum
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  animated?: boolean
  className?: string
}

export function GuildBadge({
  college,
  size = 'md',
  showName = true,
  animated = true,
  className,
}: GuildBadgeProps) {
  const guild = GUILDS[college]

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  }

  const Badge = animated ? motion.div : 'div'
  const animationProps = animated
    ? {
        whileHover: { scale: 1.1, rotate: 5 },
        whileTap: { scale: 0.95 },
      }
    : {}

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Badge
        className={cn(
          'flex items-center justify-center rounded-full shadow-lg',
          sizeClasses[size]
        )}
        style={{
          backgroundColor: guild.color,
          boxShadow: `0 0 20px ${guild.color}40`,
        }}
        {...animationProps}
      >
        <span role="img" aria-label={guild.guildName}>
          {guild.icon}
        </span>
      </Badge>
      {showName && (
        <div className="flex flex-col">
          <span
            className="font-display font-bold"
            style={{ color: guild.color }}
          >
            {guild.guildName}
          </span>
          <span className="text-xs text-muted-foreground">
            {guild.officialName}
          </span>
        </div>
      )}
    </div>
  )
}






