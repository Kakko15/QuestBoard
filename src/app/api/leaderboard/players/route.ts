import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'

interface PlayerRanking {
  rank: number
  id: string
  firstName: string
  lastName: string
  college: string
  level: number
  xp: number
  avatarUrl: string | null
}

export async function GET() {
  try {
    // Check cache first
    const cached = await redis.get<PlayerRanking[]>(CACHE_KEYS.PLAYER_LEADERBOARD)

    if (cached) {
      return NextResponse.json({ players: cached, cached: true })
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, first_name, last_name, college, level, xp, avatar_url')
      .eq('role', 'player')
      .order('xp', { ascending: false })
      .limit(100)

    if (error) {
      throw error
    }

    const players: PlayerRanking[] = (data || []).map((profile, index) => ({
      rank: index + 1,
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      college: profile.college,
      level: profile.level,
      xp: profile.xp,
      avatarUrl: profile.avatar_url,
    }))

    // Cache for 5 minutes
    await redis.set(CACHE_KEYS.PLAYER_LEADERBOARD, players, {
      ex: CACHE_TTL.LEADERBOARD,
    })

    return NextResponse.json({ players, cached: false })
  } catch (error) {
    console.error('Player leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player leaderboard' },
      { status: 500 }
    )
  }
}


