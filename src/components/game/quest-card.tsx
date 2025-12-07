'use client'

import { motion } from 'framer-motion'
import { Clock, MapPin, Camera, QrCode, Users, Sparkles, Coins } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DIFFICULTY_CONFIG } from '@/lib/constants'
import { cn, formatNumber, getTimeRemaining } from '@/lib/utils'
import { TiltCard } from '@/components/ui/tilt-card'
import type { Quest, QuestDifficulty } from '@/types'

interface QuestCardProps {
  quest: Quest
  onAccept?: () => void
  onView?: () => void
  isAccepted?: boolean
  className?: string
}

export function QuestCard({
  quest,
  onAccept,
  onView,
  isAccepted = false,
  className,
}: QuestCardProps) {
  const difficulty = DIFFICULTY_CONFIG[quest.difficulty]
  const timeRemaining = getTimeRemaining(quest.expiresAt)

  const getVerificationIcon = () => {
    switch (quest.requirements.type) {
      case 'gps':
        return <MapPin className="h-4 w-4" />
      case 'qr_code':
        return <QrCode className="h-4 w-4" />
      case 'evidence_upload':
        return <Camera className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  return (
    <TiltCard>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Card
          className={cn(
            'relative overflow-hidden border-none bg-black/40 backdrop-blur-xl transition-all duration-300 group',
            className
          )}
        >
          {/* Animated Border Gradient */}
          <div className="absolute inset-0 p-[1px] rounded-lg bg-gradient-to-br from-white/10 to-white/0 group-hover:from-neon-orange/50 group-hover:to-neon-purple/50 transition-colors" />
          
          <div className="absolute inset-0 bg-black/40 m-[1px] rounded-lg" />

          <div className="relative z-10">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Badge 
                    variant={quest.difficulty as QuestDifficulty} 
                    className="mb-2 bg-white/10 hover:bg-white/20 text-white border-none uppercase tracking-wider font-pixel text-xs"
                    style={{ color: difficulty.color }}
                  >
                    {difficulty.label}
                  </Badge>
                  <h3 className="font-display text-xl font-bold leading-tight text-white group-hover:text-neon-orange transition-colors">
                    {quest.title}
                  </h3>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pb-4">
              <p className="mb-4 text-sm text-gray-400">
                {quest.shortDescription}
              </p>

              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/10 text-neon-blue">
                  <Clock className="h-3 w-3" />
                  <span>{timeRemaining}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/10 text-neon-green">
                  {getVerificationIcon()}
                  <span className="capitalize">{quest.requirements.type.replace('_', ' ')}</span>
                </div>
                {quest.maxParticipants && (
                  <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/10 text-neon-pink">
                    <Users className="h-3 w-3" />
                    <span>
                      {quest.currentParticipants}/{quest.maxParticipants}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-white/5 pt-4 bg-white/2">
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <span className="font-pixel text-lg font-bold text-neon-purple">
                    +{formatNumber(quest.xpReward)} XP
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-pixel text-lg font-bold text-neon-orange">
                    +{formatNumber(quest.goldReward)} G
                  </span>
                </div>
              </div>

              {isAccepted ? (
                <Button size="sm" variant="outline" onClick={onView} className="font-bold">
                  VIEW
                </Button>
              ) : (
                <Button size="sm" variant="quest" onClick={onAccept} className="font-bold">
                  ACCEPT
                </Button>
              )}
            </CardFooter>
          </div>
        </Card>
      </motion.div>
    </TiltCard>
  )
}

