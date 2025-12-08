'use client'

import { useEffect, useState, useCallback } from 'react'
import { GUILDS } from '@/lib/constants'
import type { GuildLeaderboard, CollegeEnum } from '@/types'

interface PlayerRanking {
  rank: number
  id: string
  firstName: string
  lastName: string
  college: CollegeEnum
  level: number
  xp: number
  avatarUrl: string | null
}

export function useLeaderboard() {
  const [guildLeaderboard, setGuildLeaderboard] = useState<GuildLeaderboard[]>([])
  const [playerRankings, setPlayerRankings] = useState<PlayerRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch guild leaderboard
      const guildResponse = await fetch('/api/leaderboard')
      const guildData = await guildResponse.json()

      if (!guildResponse.ok) {
        throw new Error(guildData.error || 'Failed to fetch leaderboard')
      }

      // Add guild names from constants
      const leaderboardWithNames = (guildData.leaderboard || []).map((guild: GuildLeaderboard) => ({
        ...guild,
        guildName: GUILDS[guild.college]?.guildName || guild.college,
      }))

      setGuildLeaderboard(leaderboardWithNames)

      // Fetch player rankings
      const playerResponse = await fetch('/api/leaderboard/players')
      if (playerResponse.ok) {
        const playerData = await playerResponse.json()
        setPlayerRankings(playerData.players || [])
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return {
    guildLeaderboard,
    playerRankings,
    loading,
    error,
    refresh: fetchLeaderboard,
  }
}


