import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: true })

    if (achievementsError) {
      throw achievementsError
    }

    // Get user's unlocked achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', session.user.id)

    if (userAchievementsError) {
      throw userAchievementsError
    }

    // Create a map of unlocked achievements
    const unlockedMap = new Map(
      userAchievements?.map((ua) => [ua.achievement_id, ua.unlocked_at]) || []
    )

    // Combine achievements with unlock status
    const combinedAchievements = (achievements || []).map((achievement) => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      iconUrl: achievement.icon_url,
      xpBonus: achievement.xp_bonus,
      unlockedAt: unlockedMap.get(achievement.id) || null,
    }))

    return NextResponse.json({ achievements: combinedAchievements })
  } catch (error) {
    console.error('Achievements fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    )
  }
}


