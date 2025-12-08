import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const difficulty = searchParams.get('difficulty')
    const college = searchParams.get('college')
    const status = searchParams.get('status') || 'active'

    let query = supabase
      .from('quests')
      .select('*')
      .eq('is_active', status === 'active')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (difficulty && difficulty !== 'all') {
      query = query.eq('difficulty', difficulty)
    }

    if (college) {
      query = query.or(`target_colleges.is.null,target_colleges.cs.{${college}}`)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ quests: data })
  } catch (error) {
    console.error('Quests fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quests' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    if (!profile || (profile.role !== 'quest_giver' && profile.role !== 'game_master')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    const { data, error } = await supabase
      .from('quests')
      .insert({
        title: body.title,
        description: body.description,
        short_description: body.shortDescription,
        difficulty: body.difficulty,
        xp_reward: body.xpReward,
        gold_reward: body.goldReward,
        requirements: body.requirements,
        starts_at: body.startsAt,
        expires_at: body.expiresAt,
        max_participants: body.maxParticipants,
        created_by_id: session.user.id,
        target_colleges: body.targetColleges,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ quest: data })
  } catch (error) {
    console.error('Quest creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create quest' },
      { status: 500 }
    )
  }
}






