import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { redis, CACHE_KEYS, CACHE_TTL } from '@/lib/redis'
import type { GuildLeaderboard } from '@/types'

export async function GET() {
  try {
    const cached = await redis.get<GuildLeaderboard[]>(CACHE_KEYS.GUILD_LEADERBOARD)

    if (cached) {
      return NextResponse.json({ leaderboard: cached, cached: true })
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('user_profiles')
      .select('college, xp, level')

    if (error) {
      throw error
    }

    const guildStats = data.reduce((acc, profile) => {
      const college = profile.college
      if (!acc[college]) {
        acc[college] = { totalXp: 0, totalMembers: 0, totalLevel: 0 }
      }
      acc[college].totalXp += profile.xp
      acc[college].totalMembers += 1
      acc[college].totalLevel += profile.level
      return acc
    }, {} as Record<string, { totalXp: number; totalMembers: number; totalLevel: number }>)

    const leaderboard: GuildLeaderboard[] = Object.entries(guildStats)
      .map(([college, stats]) => ({
        college: college as GuildLeaderboard['college'],
        guildName: '',
        totalXp: stats.totalXp,
        totalMembers: stats.totalMembers,
        averageLevel: stats.totalMembers > 0 ? stats.totalLevel / stats.totalMembers : 0,
        rank: 0,
      }))
      .sort((a, b) => b.totalXp - a.totalXp)
      .map((guild, index) => ({ ...guild, rank: index + 1 }))

    await redis.set(CACHE_KEYS.GUILD_LEADERBOARD, leaderboard, {
      ex: CACHE_TTL.LEADERBOARD,
    })

    return NextResponse.json({ leaderboard, cached: false })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}




