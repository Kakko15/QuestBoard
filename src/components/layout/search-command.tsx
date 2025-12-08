'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Scroll,
  Users,
  User,
  Trophy,
  ArrowRight,
  Command,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { GUILDS, DIFFICULTY_CONFIG } from '@/lib/constants'
import type { CollegeEnum, QuestDifficulty } from '@/types'

interface SearchResult {
  id: string
  type: 'quest' | 'player' | 'guild' | 'page'
  title: string
  subtitle?: string
  href: string
  icon?: React.ReactNode
  color?: string
}

const QUICK_LINKS: SearchResult[] = [
  { id: 'quests', type: 'page', title: 'Quest Board', subtitle: 'Browse available quests', href: '/quests', icon: <Scroll className="h-4 w-4" /> },
  { id: 'leaderboard', type: 'page', title: 'Leaderboard', subtitle: 'View rankings', href: '/leaderboard', icon: <Trophy className="h-4 w-4" /> },
  { id: 'profile', type: 'page', title: 'My Profile', subtitle: 'View your stats', href: '/profile', icon: <User className="h-4 w-4" /> },
]

interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(QUICK_LINKS)
      return
    }

    setLoading(true)

    try {
      // Search quests
      const questsResponse = await fetch(`/api/quests?search=${encodeURIComponent(searchQuery)}`)
      const questsData = await questsResponse.json()

      // Search players
      const playersResponse = await fetch(`/api/leaderboard/players?search=${encodeURIComponent(searchQuery)}`)
      const playersData = await playersResponse.json()

      const searchResults: SearchResult[] = []

      // Add matching quests
      if (questsData.quests) {
        questsData.quests.slice(0, 5).forEach((quest: any) => {
          const difficulty = DIFFICULTY_CONFIG[quest.difficulty as QuestDifficulty]
          searchResults.push({
            id: quest.id,
            type: 'quest',
            title: quest.title,
            subtitle: `${difficulty?.label || quest.difficulty} Quest • +${quest.xp_reward} XP`,
            href: `/quests?highlight=${quest.id}`,
            icon: <Scroll className="h-4 w-4" />,
            color: difficulty?.color,
          })
        })
      }

      // Add matching players
      if (playersData.players) {
        playersData.players.slice(0, 5).forEach((player: any) => {
          const guild = GUILDS[player.college as CollegeEnum]
          searchResults.push({
            id: player.id,
            type: 'player',
            title: `${player.firstName} ${player.lastName}`,
            subtitle: `Level ${player.level} • ${guild?.guildName || player.college}`,
            href: `/leaderboard?player=${player.id}`,
            icon: <User className="h-4 w-4" />,
            color: guild?.color,
          })
        })
      }

      // Add guild results
      Object.entries(GUILDS).forEach(([key, guild]) => {
        if (
          guild.guildName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guild.acronym.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guild.officialName.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          searchResults.push({
            id: key,
            type: 'guild',
            title: guild.guildName,
            subtitle: guild.officialName,
            href: `/leaderboard?guild=${key}`,
            icon: <Users className="h-4 w-4" />,
            color: guild.color,
          })
        }
      })

      // Add quick links that match
      QUICK_LINKS.forEach((link) => {
        if (link.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          searchResults.push(link)
        }
      })

      setResults(searchResults.length > 0 ? searchResults : QUICK_LINKS)
    } catch (error) {
      console.error('Search error:', error)
      setResults(QUICK_LINKS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, search])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setResults(QUICK_LINKS)
      setSelectedIndex(0)
    }
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % results.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length)
        break
      case 'Enter':
        e.preventDefault()
        if (results[selectedIndex]) {
          router.push(results[selectedIndex].href)
          onOpenChange(false)
        }
        break
    }
  }

  const handleSelect = (result: SearchResult) => {
    router.push(result.href)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 bg-gray-900 border-white/10 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search quests, players, guilds..."
            className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-gray-500"
            autoFocus
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] text-gray-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto py-2">
          {!query && (
            <div className="px-3 py-1.5 text-xs text-gray-500 uppercase tracking-wider">
              Quick Links
            </div>
          )}
          
          <AnimatePresence mode="popLayout">
            {results.map((result, index) => (
              <motion.button
                key={result.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleSelect(result)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                  selectedIndex === index
                    ? 'bg-white/10'
                    : 'hover:bg-white/5'
                )}
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${result.color || '#6b7280'}20` }}
                >
                  <span style={{ color: result.color || '#9ca3af' }}>
                    {result.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate">
                    {result.title}
                  </div>
                  {result.subtitle && (
                    <div className="text-sm text-gray-400 truncate">
                      {result.subtitle}
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-gray-500" />
              </motion.button>
            ))}
          </AnimatePresence>

          {results.length === 0 && !loading && (
            <div className="py-12 text-center">
              <Search className="mx-auto h-10 w-10 text-gray-600" />
              <p className="mt-3 text-sm text-gray-400">No results found</p>
              <p className="text-xs text-gray-500">
                Try searching for quests, players, or guilds
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px]">↵</kbd>
              Select
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>K to open</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook to manage search command
export function useSearchCommand() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { open, setOpen }
}


