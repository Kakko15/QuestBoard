'use client'

import { useState, useMemo, useCallback } from 'react'
import { Search, Filter, Scroll, Sparkles, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { QuestCard } from '@/components/game/quest-card'
import { QuestDetailModal } from '@/components/game/quest-detail-modal'
import { QuestVerificationModal } from '@/components/game/quest-verification-modal'
import { useUser } from '@/hooks/use-user'
import { useQuests } from '@/hooks/use-quests'
import { useToast } from '@/hooks/use-toast'
import { DIFFICULTY_CONFIG } from '@/lib/constants'
import type { Quest, QuestDifficulty } from '@/types'

export default function QuestsPage() {
  const { user, signOut } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('available')
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [acceptingQuestId, setAcceptingQuestId] = useState<string | null>(null)
  const { toast } = useToast()

  const { 
    quests, 
    activeQuests, 
    completedQuests, 
    loading, 
    error,
    acceptQuest,
    completeQuest,
    refresh 
  } = useQuests({
    difficulty: difficultyFilter as QuestDifficulty | 'all',
    college: user?.college,
    includeUserLogs: true,
  })

  const handleAcceptQuest = useCallback(async (quest: Quest) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to accept quests',
        variant: 'destructive',
      })
      return
    }

    setAcceptingQuestId(quest.id)
    const result = await acceptQuest(quest.id)
    setAcceptingQuestId(null)

    if (result.success) {
      toast({
        title: 'Quest Accepted!',
        description: `You have accepted "${quest.title}". Good luck, adventurer!`,
      })
    } else {
      toast({
        title: 'Failed to Accept Quest',
        description: result.error,
        variant: 'destructive',
      })
    }
  }, [user, acceptQuest, toast])

  const handleViewQuest = useCallback((quest: Quest) => {
    setSelectedQuest(quest)
    setShowDetailModal(true)
  }, [])

  const handleStartVerification = useCallback((quest: Quest) => {
    setSelectedQuest(quest)
    setShowVerificationModal(true)
  }, [])

  const handleCompleteQuest = useCallback(async (proofUrl?: string) => {
    if (!selectedQuest) return

    const result = await completeQuest(selectedQuest.id, proofUrl)
    setShowVerificationModal(false)
    
    if (result.success) {
      toast({
        title: 'Quest Completed! 🎉',
        description: `You earned +${result.rewards?.xp || selectedQuest.xpReward} XP and +${result.rewards?.gold || selectedQuest.goldReward} Gold!`,
      })
    } else {
      toast({
        title: 'Failed to Complete Quest',
        description: result.error,
        variant: 'destructive',
      })
    }
  }, [selectedQuest, completeQuest, toast])

  // Memoize filtered quests to prevent unnecessary re-renders
  const filteredAvailable = useMemo(() => {
    return quests.filter((quest) => {
      const matchesSearch =
        quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quest.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [quests, searchQuery])

  const filteredActive = useMemo(() => {
    return activeQuests.filter((quest) => {
      const matchesSearch =
        quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quest.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [activeQuests, searchQuery])

  const filteredCompleted = useMemo(() => {
    return completedQuests.filter((quest) => {
      const matchesSearch =
        quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quest.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [completedQuests, searchQuery])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar user={user} onSignOut={signOut} />

      <main className="container mx-auto px-4 pt-28 pb-20">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-neon-orange to-orange-600">
              <Scroll className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Quest Board</h1>
              <p className="text-muted-foreground">
                Browse and accept quests to earn XP and Gold
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search quests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <span style={{ color: config.color }}>{config.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => refresh()}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="available" className="gap-2 data-[state=active]:bg-neon-green data-[state=active]:text-black">
              <Scroll className="h-4 w-4" />
              Available ({filteredAvailable.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2 data-[state=active]:bg-neon-orange data-[state=active]:text-black">
              <Sparkles className="h-4 w-4" />
              Active ({filteredActive.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2 data-[state=active]:bg-neon-purple data-[state=active]:text-white">
              <CheckCircle2 className="h-4 w-4" />
              Completed ({filteredCompleted.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-neon-green" />
                <p className="mt-4 text-muted-foreground">Loading quests...</p>
              </div>
            ) : filteredAvailable.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAvailable.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onAccept={() => handleAcceptQuest(quest)}
                    onView={() => handleViewQuest(quest)}
                    isAccepting={acceptingQuestId === quest.id}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Scroll className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No quests found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search' : 'Check back later for new quests'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            {filteredActive.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredActive.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    isAccepted
                    onView={() => handleStartVerification(quest)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No active quests</h3>
                <p className="text-muted-foreground">
                  Accept a quest to start your adventure
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {filteredCompleted.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredCompleted.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    isCompleted
                    onView={() => handleViewQuest(quest)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-semibold">No completed quests yet</h3>
                <p className="text-muted-foreground">
                  Complete quests to see them here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Quest Detail Modal */}
      <QuestDetailModal
        quest={selectedQuest}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onAccept={selectedQuest ? () => handleAcceptQuest(selectedQuest) : undefined}
        isAccepting={acceptingQuestId === selectedQuest?.id}
      />

      {/* Quest Verification Modal */}
      <QuestVerificationModal
        quest={selectedQuest}
        open={showVerificationModal}
        onOpenChange={setShowVerificationModal}
        onComplete={handleCompleteQuest}
      />
    </div>
  )
}
