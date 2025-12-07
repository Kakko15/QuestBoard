import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('*')
      .eq('id', params.id)
      .single()

    if (questError || !quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    if (!quest.is_active || new Date(quest.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Quest is no longer available' }, { status: 400 })
    }

    if (quest.max_participants && quest.current_participants >= quest.max_participants) {
      return NextResponse.json({ error: 'Quest is full' }, { status: 400 })
    }

    const { data: existingLog } = await supabase
      .from('user_quest_logs')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('quest_id', params.id)
      .single()

    if (existingLog) {
      return NextResponse.json({ error: 'Quest already accepted' }, { status: 400 })
    }

    const { data: questLog, error: logError } = await supabase
      .from('user_quest_logs')
      .insert({
        user_id: session.user.id,
        quest_id: params.id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (logError) {
      throw logError
    }

    await supabase
      .from('quests')
      .update({ current_participants: quest.current_participants + 1 })
      .eq('id', params.id)

    return NextResponse.json({ questLog })
  } catch (error) {
    console.error('Quest accept error:', error)
    return NextResponse.json(
      { error: 'Failed to accept quest' },
      { status: 500 }
    )
  }
}




