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

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'game_master') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: questLogs, error } = await supabase
      .from('user_quest_logs')
      .select(`
        id,
        user_id,
        quest_id,
        status,
        started_at,
        completed_at,
        xp_awarded,
        gold_awarded,
        created_at,
        user_profiles (
          student_id,
          college,
          level
        ),
        quests (
          title,
          difficulty,
          xp_reward
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10000)

    if (error) {
      throw error
    }

    const csvHeaders = [
      'log_id',
      'user_id',
      'student_id',
      'college',
      'user_level',
      'quest_id',
      'quest_title',
      'quest_difficulty',
      'status',
      'started_at',
      'completed_at',
      'xp_awarded',
      'gold_awarded',
      'created_at',
    ].join(',')

    const csvRows = questLogs.map((log: Record<string, unknown>) => {
      const userProfile = log.user_profiles as Record<string, unknown> | null
      const quest = log.quests as Record<string, unknown> | null

      return [
        log.id,
        log.user_id,
        userProfile?.student_id || '',
        userProfile?.college || '',
        userProfile?.level || '',
        log.quest_id,
        quest?.title || '',
        quest?.difficulty || '',
        log.status,
        log.started_at,
        log.completed_at || '',
        log.xp_awarded,
        log.gold_awarded,
        log.created_at,
      ].join(',')
    })

    const csv = [csvHeaders, ...csvRows].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="quest_logs_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}




