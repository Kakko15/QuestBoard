'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Sparkles, Users, Target, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GuildBadge } from '@/components/game/guild-badge'
import { GUILDS } from '@/lib/constants'
import type { CollegeEnum } from '@/types'

const slides = [
  {
    title: 'Welcome to QuestBoard',
    subtitle: 'Your Campus Adventure Begins',
    description: 'Transform your university experience into an epic RPG journey at ISU-Echague Campus.',
    icon: (
      <div className="relative h-20 w-20 overflow-hidden rounded-xl">
        <Image 
          src="/logo-symbol-only.png" 
          alt="QuestBoard Logo" 
          fill
          sizes="80px"
          className="object-cover p-2"
        />
      </div>
    ),
    color: 'from-neon-purple to-neon-green',
  },
  {
    title: 'Complete Quests',
    subtitle: 'Earn XP & Gold',
    description: 'Participate in campus activities, seminars, and events to earn rewards and level up your character.',
    icon: '📜',
    color: 'from-neon-green to-emerald-600',
  },
  {
    title: 'Join Your Guild',
    subtitle: '11 Departments, 11 Guilds',
    description: 'Represent your college and compete with other departments for the top spot on the leaderboard.',
    icon: '🛡️',
    color: 'from-neon-purple to-indigo-600',
  },
  {
    title: 'Rise to Glory',
    subtitle: 'Become a Legend',
    description: 'Unlock achievements, climb the ranks, and become the ultimate champion of ISU-Echague!',
    icon: '👑',
    color: 'from-neon-orange to-yellow-500',
  },
]

const guildKeys = Object.keys(GUILDS) as CollegeEnum[]

export default function WelcomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showGuilds, setShowGuilds] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (currentSlide < slides.length - 1 && !showGuilds) {
      const timer = setTimeout(() => {
        setCurrentSlide((prev) => prev + 1)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [currentSlide, showGuilds])

  const handleGetStarted = () => {
    setShowGuilds(true)
  }

  const handleContinue = () => {
    localStorage.setItem('questboard_welcomed', 'true')
    router.replace('/') // Use replace to not pollute browser history
  }

  const slide = slides[currentSlide]

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {!showGuilds ? (
          <motion.div
            key="slides"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex min-h-screen flex-col items-center justify-center px-4"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className={`mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br ${slide.color} text-6xl shadow-2xl`}
                >
                  {slide.icon}
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mb-2 text-sm font-medium uppercase tracking-wider text-neon-green"
                >
                  {slide.subtitle}
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-display text-4xl font-bold md:text-5xl"
                >
                  {slide.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mx-auto mt-4 max-w-md text-muted-foreground"
                >
                  {slide.description}
                </motion.p>
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-neon-green'
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12"
            >
              {currentSlide === slides.length - 1 ? (
                <Button
                  size="lg"
                  variant="quest"
                  onClick={handleGetStarted}
                  className="gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  Discover the Guilds
                  <ChevronRight className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentSlide(slides.length - 1)}
                  className="text-muted-foreground"
                >
                  Skip Introduction
                </Button>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="guilds"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative min-h-screen px-4 py-12"
          >
            <div className="mx-auto max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
              >
                <h2 className="font-display text-3xl font-bold">
                  The 11 Guilds of ISU-Echague
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Each department has its own unique guild identity
                </p>
              </motion.div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {guildKeys.map((key, index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-lg border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-neon-purple/30 hover:bg-card"
                  >
                    <GuildBadge college={key} size="sm" />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 text-center"
              >
                <div className="mb-8 flex justify-center gap-8">
                  <div className="text-center">
                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-neon-orange/20">
                      <Target className="h-6 w-6 text-neon-orange" />
                    </div>
                    <p className="mt-2 text-2xl font-bold">50+</p>
                    <p className="text-xs text-muted-foreground">Active Quests</p>
                  </div>
                  <div className="text-center">
                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-neon-purple/20">
                      <Users className="h-6 w-6 text-neon-purple" />
                    </div>
                    <p className="mt-2 text-2xl font-bold">3,000+</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                  <div className="text-center">
                    <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-neon-green/20">
                      <Trophy className="h-6 w-6 text-neon-green" />
                    </div>
                    <p className="mt-2 text-2xl font-bold">11</p>
                    <p className="text-xs text-muted-foreground">Guilds</p>
                  </div>
                </div>

                <Button
                  size="lg"
                  variant="quest"
                  onClick={handleContinue}
                  className="gap-2"
                >
                  <Sparkles className="h-5 w-5" />
                  Enter QuestBoard
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}




