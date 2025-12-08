'use client'

import { useEffect, useState, useCallback } from 'react'

interface Achievement {
  id: string
  name: string
  description: string
  iconUrl: string | null
  xpBonus: number
  unlockedAt: string | null
}

interface QuestHistoryItem {
  id: string
  status: string
  startedAt: string
  completedAt: string | null
  xpAwarded: number
  goldAwarded: number
  quest: {
    id: string
    title: string
    shortDescription: string
    difficulty: string
    xpReward: number
    goldReward: number
  } | null
}

interface UserStats {
  xp: number
  gold: number
  level: number
  activityStreak: number
  questsCompleted: number
  guildRank: number
  achievementsUnlocked: number
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/achievements')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch achievements')
      }

      setAchievements(data.achievements || [])
    } catch (err) {
      console.error('Error fetching achievements:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch achievements')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length

  return {
    achievements,
    unlockedCount,
    totalCount: achievements.length,
    loading,
    error,
    refresh: fetchAchievements,
  }
}

export function useQuestHistory() {
  const [history, setHistory] = useState<QuestHistoryItem[]>([])
  const [stats, setStats] = useState({ totalQuests: 0, completedQuests: 0, totalXpEarned: 0, totalGoldEarned: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/user/quest-history')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch quest history')
      }

      setHistory(data.history || [])
      setStats(data.stats || { totalQuests: 0, completedQuests: 0, totalXpEarned: 0, totalGoldEarned: 0 })
    } catch (err) {
      console.error('Error fetching quest history:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch quest history')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    stats,
    loading,
    error,
    refresh: fetchHistory,
  }
}

export function useUserStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/user/stats')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user stats')
      }

      setStats(data.stats)
    } catch (err) {
      console.error('Error fetching user stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch user stats')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  }
}


