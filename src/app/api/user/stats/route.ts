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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) {
      throw profileError || new Error('Profile not found')
    }

    // Get quest completion stats
    const { data: questLogs, error: questError } = await supabase
      .from('user_quest_logs')
      .select('status')
      .eq('user_id', session.user.id)

    if (questError) {
      throw questError
    }

    const questsCompleted = questLogs?.filter((q) => q.status === 'completed').length || 0

    // Get guild rank
    const { data: guildMembers, error: guildError } = await supabase
      .from('user_profiles')
      .select('id, xp')
      .eq('college', profile.college)
      .order('xp', { ascending: false })

    if (guildError) {
      throw guildError
    }

    const guildRank = guildMembers?.findIndex((m) => m.id === session.user.id) + 1 || 0

    // Get achievements count
    const { count: achievementsCount, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', session.user.id)

    if (achievementsError) {
      throw achievementsError
    }

    return NextResponse.json({
      stats: {
        xp: profile.xp,
        gold: profile.gold,
        level: profile.level,
        activityStreak: profile.activity_streak,
        questsCompleted,
        guildRank,
        achievementsUnlocked: achievementsCount || 0,
      },
    })
  } catch (error) {
    console.error('User stats fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}


