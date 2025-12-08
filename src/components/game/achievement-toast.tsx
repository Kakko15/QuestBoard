'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AchievementToastProps {
  isVisible: boolean
  title: string
  description: string
  xpBonus: number
  onClose: () => void
}

export function AchievementToast({
  isVisible,
  title,
  description,
  xpBonus,
  onClose,
}: AchievementToastProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className="fixed left-1/2 top-4 z-50 w-full max-w-md -translate-x-1/2"
        >
          <div className="relative overflow-hidden rounded-lg border-2 border-amber-500 bg-gradient-to-r from-amber-900/90 to-orange-900/90 p-4 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-[url('/sparkles.svg')] opacity-10" />

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 text-amber-300 hover:text-white"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-4">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg"
              >
                <Trophy className="h-8 w-8 text-white" />
              </motion.div>

              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs font-semibold uppercase tracking-wider text-amber-300"
                >
                  Achievement Unlocked!
                </motion.div>
                <motion.h3
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-display text-xl font-bold text-white"
                >
                  {title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-sm text-amber-100/80"
                >
                  {description}
                </motion.p>
              </div>
            </div>

            {xpBonus > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-3 flex items-center justify-center gap-2 rounded-full bg-amber-500/20 py-2"
              >
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="font-bold text-amber-400">+{xpBonus} Bonus XP</span>
              </motion.div>
            )}

            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 w-full origin-left bg-amber-400"
              onAnimationComplete={onClose}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}







