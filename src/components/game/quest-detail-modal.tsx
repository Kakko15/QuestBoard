'use client'

import { motion } from 'framer-motion'
import {
  Clock,
  MapPin,
  Camera,
  QrCode,
  Users,
  Sparkles,
  Calendar,
  Target,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DIFFICULTY_CONFIG } from '@/lib/constants'
import { formatNumber, getTimeRemaining, formatDate } from '@/lib/utils'
import type { Quest, QuestDifficulty } from '@/types'

interface QuestDetailModalProps {
  quest: Quest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAccept?: () => void
  isAccepting?: boolean
  isAccepted?: boolean
}

export function QuestDetailModal({
  quest,
  open,
  onOpenChange,
  onAccept,
  isAccepting = false,
  isAccepted = false,
}: QuestDetailModalProps) {
  if (!quest) return null

  const difficulty = DIFFICULTY_CONFIG[quest.difficulty]
  const timeRemaining = getTimeRemaining(quest.expiresAt)

  const getVerificationIcon = () => {
    switch (quest.requirements.type) {
      case 'gps':
        return <MapPin className="h-5 w-5" />
      case 'qr_code':
        return <QrCode className="h-5 w-5" />
      case 'evidence_upload':
        return <Camera className="h-5 w-5" />
      default:
        return <Sparkles className="h-5 w-5" />
    }
  }

  const getVerificationDescription = () => {
    switch (quest.requirements.type) {
      case 'gps':
        return `Go to the quest location and verify your presence. You must be within ${quest.requirements.radiusMeters}m of the target.`
      case 'qr_code':
        return 'Scan the QR code at the event location to complete this quest.'
      case 'evidence_upload':
        return `Upload photo evidence: ${quest.requirements.description}`
      case 'manual':
        return `Manual verification required: ${quest.requirements.instructions}`
      default:
        return 'Follow the quest instructions to complete.'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-white/10 text-white p-0 overflow-hidden">
        {/* Header with gradient */}
        <div
          className="p-6 bg-gradient-to-br"
          style={{
            backgroundImage: `linear-gradient(135deg, ${difficulty.color}30, transparent)`,
          }}
        >
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <Badge
                  className="mb-2 uppercase tracking-wider font-pixel text-xs"
                  style={{ backgroundColor: `${difficulty.color}30`, color: difficulty.color }}
                >
                  {difficulty.label}
                </Badge>
                <DialogTitle className="text-2xl font-display font-bold text-white">
                  {quest.title}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-gray-300 leading-relaxed">{quest.description}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2 text-neon-purple mb-1">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs uppercase">XP Reward</span>
              </div>
              <div className="font-display text-xl font-bold">
                +{formatNumber(quest.xpReward)}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2 text-neon-orange mb-1">
                <Target className="h-4 w-4" />
                <span className="text-xs uppercase">Gold</span>
              </div>
              <div className="font-display text-xl font-bold">
                +{formatNumber(quest.goldReward)}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex items-center gap-2 text-neon-blue mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs uppercase">Time Left</span>
              </div>
              <div className="font-display text-xl font-bold">{timeRemaining}</div>
            </div>
            {quest.maxParticipants && (
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 text-neon-pink mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-xs uppercase">Slots</span>
                </div>
                <div className="font-display text-xl font-bold">
                  {quest.currentParticipants}/{quest.maxParticipants}
                </div>
              </div>
            )}
          </div>

          {/* Verification Method */}
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${difficulty.color}20` }}
              >
                {getVerificationIcon()}
              </div>
              <div>
                <h3 className="font-semibold capitalize">
                  {quest.requirements.type.replace('_', ' ')} Verification
                </h3>
                <p className="text-sm text-gray-400">{getVerificationDescription()}</p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Started: {formatDate(quest.startsAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Expires: {formatDate(quest.expiresAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              className="flex-1 border-white/20 hover:bg-white/5"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {!isAccepted && onAccept && (
              <Button
                className="flex-1 bg-neon-green text-black hover:bg-neon-green/80 font-bold"
                onClick={onAccept}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  'Accept Quest'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


