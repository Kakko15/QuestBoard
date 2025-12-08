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

    // Get user's quest logs with quest details
    const { data: questLogs, error } = await supabase
      .from('user_quest_logs')
      .select(`
        *,
        quest:quests(*)
      `)
      .eq('user_id', session.user.id)
      .order('started_at', { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    // Transform the data
    const history = (questLogs || []).map((log) => ({
      id: log.id,
      status: log.status,
      startedAt: log.started_at,
      completedAt: log.completed_at,
      xpAwarded: log.xp_awarded,
      goldAwarded: log.gold_awarded,
      quest: log.quest ? {
        id: log.quest.id,
        title: log.quest.title,
        shortDescription: log.quest.short_description,
        difficulty: log.quest.difficulty,
        xpReward: log.quest.xp_reward,
        goldReward: log.quest.gold_reward,
      } : null,
    }))

    // Calculate stats
    const stats = {
      totalQuests: history.length,
      completedQuests: history.filter((h) => h.status === 'completed').length,
      totalXpEarned: history.reduce((sum, h) => sum + h.xpAwarded, 0),
      totalGoldEarned: history.reduce((sum, h) => sum + h.goldAwarded, 0),
    }

    return NextResponse.json({ history, stats })
  } catch (error) {
    console.error('Quest history fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quest history' },
      { status: 500 }
    )
  }
}


