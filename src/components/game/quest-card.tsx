'use client'

import { memo } from 'react'
import { Clock, MapPin, Camera, QrCode, Users, Sparkles, Loader2, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DIFFICULTY_CONFIG } from '@/lib/constants'
import { cn, formatNumber, getTimeRemaining } from '@/lib/utils'
import type { Quest, QuestDifficulty } from '@/types'

interface QuestCardProps {
  quest: Quest
  onAccept?: () => void
  onView?: () => void
  isAccepted?: boolean
  isAccepting?: boolean
  isCompleted?: boolean
  className?: string
}

export const QuestCard = memo(function QuestCard({
  quest,
  onAccept,
  onView,
  isAccepted = false,
  isAccepting = false,
  isCompleted = false,
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

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge className="absolute top-3 right-3 bg-neon-green/20 text-neon-green border-neon-green/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      )
    }
    if (isAccepted) {
      return (
        <Badge className="absolute top-3 right-3 bg-neon-orange/20 text-neon-orange border-neon-orange/30">
          <Sparkles className="h-3 w-3 mr-1" />
          In Progress
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="group">
      <Card
        className={cn(
          'relative overflow-hidden border-none bg-black/40 backdrop-blur-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-lg',
          isCompleted && 'opacity-75',
          className
        )}
      >
        {/* Animated Border Gradient */}
        <div className={cn(
          'absolute inset-0 p-[1px] rounded-lg bg-gradient-to-br transition-opacity duration-200',
          isCompleted 
            ? 'from-neon-green/30 to-neon-green/10'
            : isAccepted
            ? 'from-neon-orange/30 to-neon-purple/30'
            : 'from-white/10 to-white/0 group-hover:from-neon-orange/50 group-hover:to-neon-purple/50'
        )} />
        
        <div className="absolute inset-0 bg-black/40 m-[1px] rounded-lg" />

        <div className="relative z-10">
          <CardHeader className="pb-2">
            {getStatusBadge()}
            <div className="flex items-start justify-between">
              <div className="flex-1 pr-20">
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
              {!isCompleted && (
                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded border border-white/10 text-neon-blue">
                  <Clock className="h-3 w-3" />
                  <span>{timeRemaining}</span>
                </div>
              )}
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

            {isCompleted ? (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onView} 
                className="font-bold border-neon-green/30 text-neon-green hover:bg-neon-green/10"
              >
                VIEW
              </Button>
            ) : isAccepted ? (
              <Button 
                size="sm" 
                variant="quest" 
                onClick={onView} 
                className="font-bold bg-neon-orange text-black hover:bg-neon-orange/80"
              >
                COMPLETE
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="quest" 
                onClick={onAccept} 
                className="font-bold"
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ...
                  </>
                ) : (
                  'ACCEPT'
                )}
              </Button>
            )}
          </CardFooter>
        </div>
      </Card>
    </div>
  )
})
