'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Scroll, Sparkles } from 'lucide-react'
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
import { createClient } from '@/lib/supabase/client'
import { DIFFICULTY_CONFIG } from '@/lib/constants'
import type { UserProfile, Quest, QuestDifficulty } from '@/types'

const mockQuests: Quest[] = [
  {
    id: '1',
    title: 'Campus Clean-Up Drive',
    description: 'Join the environmental club in cleaning the campus grounds. Help maintain the beauty of ISU-Echague by participating in this community service activity.',
    shortDescription: 'Help keep our campus clean and earn rewards!',
    difficulty: 'common',
    xpReward: 150,
    goldReward: 50,
    requirements: { type: 'gps', latitude: 16.7056, longitude: 121.6453, radiusMeters: 100 },
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    maxParticipants: 50,
    currentParticipants: 23,
    createdById: 'system',
    targetColleges: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Leadership Seminar Attendance',
    description: 'Attend the SSC Leadership Development Seminar at the Audio Visual Room. Learn from industry experts about effective leadership strategies.',
    shortDescription: 'Develop your leadership skills with industry experts.',
    difficulty: 'uncommon',
    xpReward: 300,
    goldReward: 100,
    requirements: { type: 'qr_code', code: 'LEAD-2024-SSC' },
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    maxParticipants: 100,
    currentParticipants: 67,
    createdById: 'system',
    targetColleges: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Blood Donation Drive',
    description: 'Donate blood and save lives at the university gymnasium. Your contribution can save up to three lives.',
    shortDescription: 'Be a hero - donate blood and save lives.',
    difficulty: 'rare',
    xpReward: 500,
    goldReward: 200,
    requirements: { type: 'evidence_upload', description: 'Upload photo of donation certificate' },
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    maxParticipants: 200,
    currentParticipants: 45,
    createdById: 'system',
    targetColleges: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Tech Talk: AI in Education',
    description: 'Join CCSICT for an exclusive tech talk about the future of AI in education. Network with professionals and learn about emerging technologies.',
    shortDescription: 'Discover the future of AI in education.',
    difficulty: 'epic',
    xpReward: 750,
    goldReward: 300,
    requirements: { type: 'qr_code', code: 'TECH-AI-2024' },
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    maxParticipants: 150,
    currentParticipants: 89,
    createdById: 'system',
    targetColleges: ['CCSICT'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Inter-Guild Sports Festival',
    description: 'Represent your guild in the annual Inter-Guild Sports Festival. Compete in various sports and bring glory to your department.',
    shortDescription: 'Compete for your guild in the sports festival!',
    difficulty: 'legendary',
    xpReward: 1500,
    goldReward: 500,
    requirements: { type: 'manual', instructions: 'Register at the OSA office' },
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 14).toISOString(),
    maxParticipants: null,
    currentParticipants: 0,
    createdById: 'system',
    targetColleges: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Library Research Hours',
    description: 'Spend productive time in the university library. Complete research tasks and earn rewards for your academic dedication.',
    shortDescription: 'Earn rewards for productive library time.',
    difficulty: 'common',
    xpReward: 100,
    goldReward: 30,
    requirements: { type: 'gps', latitude: 16.7058, longitude: 121.6455, radiusMeters: 50 },
    startsAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    maxParticipants: null,
    currentParticipants: 156,
    createdById: 'system',
    targetColleges: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function QuestsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('available')
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            studentId: profile.student_id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            college: profile.college,
            role: profile.role,
            xp: profile.xp,
            gold: profile.gold,
            level: profile.level,
            avatarUrl: profile.avatar_url,
            activityStreak: profile.activity_streak,
            lastActiveAt: profile.last_active_at,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
          })
        }
      }
    }

    fetchUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const filteredQuests = mockQuests.filter((quest) => {
    const matchesSearch =
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty =
      difficultyFilter === 'all' || quest.difficulty === difficultyFilter
    return matchesSearch && matchesDifficulty
  })

  return (
    <div className="min-h-screen">
      <Navbar user={user} onSignOut={handleSignOut} />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
              <Scroll className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold">Quest Board</h1>
              <p className="text-muted-foreground">
                Browse and accept quests to earn XP and Gold
              </p>
            </div>
          </div>
        </motion.div>

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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="available" className="gap-2">
              <Scroll className="h-4 w-4" />
              Available ({filteredQuests.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Active (0)
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              Completed (0)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            {filteredQuests.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredQuests.map((quest, index) => (
                  <motion.div
                    key={quest.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <QuestCard quest={quest} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Scroll className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No quests found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="active">
            <div className="py-12 text-center">
              <Sparkles className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No active quests</h3>
              <p className="text-muted-foreground">
                Accept a quest to start your adventure
              </p>
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="py-12 text-center">
              <Scroll className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No completed quests yet</h3>
              <p className="text-muted-foreground">
                Complete quests to see them here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}




