'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Share2,
  Copy,
  Check,
  Facebook,
  Twitter,
  MessageCircle,
  Link,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import type { Quest } from '@/types'

interface ShareQuestProps {
  quest: Quest | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareQuest({ quest, open, onOpenChange }: ShareQuestProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  if (!quest) return null

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/quests?highlight=${quest.id}`
    : ''

  const shareText = `Check out this quest on QuestBoard: "${quest.title}" - Earn ${quest.xpReward} XP and ${quest.goldReward} Gold!`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast({
        title: 'Link Copied!',
        description: 'Share link has been copied to clipboard',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: 'Copy Failed',
        description: 'Please copy the link manually',
        variant: 'destructive',
      })
    }
  }

  const handleShare = (platform: string) => {
    const encodedText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(shareUrl)

    let shareLink = ''
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
        break
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`
        break
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400')
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: quest.title,
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or share failed
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-gray-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-neon-green" />
            Share Quest
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quest Preview */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <h3 className="font-bold text-white">{quest.title}</h3>
            <p className="text-sm text-gray-400 mt-1">{quest.shortDescription}</p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="text-neon-purple">+{quest.xpReward} XP</span>
              <span className="text-neon-orange">+{quest.goldReward} Gold</span>
            </div>
          </div>

          {/* Copy Link */}
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="bg-white/5 border-white/10 text-gray-300 text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="border-white/20 shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-neon-green" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {typeof navigator !== 'undefined' && navigator.share && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNativeShare}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-neon-green/10 hover:bg-neon-green/20 transition-colors"
              >
                <Share2 className="h-5 w-5 text-neon-green" />
                <span className="text-xs text-gray-400">Share</span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare('twitter')}
              className="flex flex-col items-center gap-1 p-3 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 transition-colors"
            >
              <Twitter className="h-5 w-5 text-sky-400" />
              <span className="text-xs text-gray-400">Twitter</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare('facebook')}
              className="flex flex-col items-center gap-1 p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
            >
              <Facebook className="h-5 w-5 text-blue-400" />
              <span className="text-xs text-gray-400">Facebook</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleShare('whatsapp')}
              className="flex flex-col items-center gap-1 p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
            >
              <MessageCircle className="h-5 w-5 text-green-400" />
              <span className="text-xs text-gray-400">WhatsApp</span>
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


