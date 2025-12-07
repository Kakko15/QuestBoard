import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { redis, CACHE_KEYS } from '@/lib/redis'
import { calculateDistance } from '@/lib/utils'

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

    const body = await request.json()

    const { data: questLog, error: logError } = await supabase
      .from('user_quest_logs')
      .select('*, quests(*)')
      .eq('user_id', session.user.id)
      .eq('quest_id', params.id)
      .eq('status', 'in_progress')
      .single()

    if (logError || !questLog) {
      return NextResponse.json({ error: 'Quest not in progress' }, { status: 400 })
    }

    const quest = questLog.quests
    const requirements = quest.requirements

    let verified = false

    switch (requirements.type) {
      case 'gps':
        if (body.latitude && body.longitude) {
          const distance = calculateDistance(
            body.latitude,
            body.longitude,
            requirements.latitude,
            requirements.longitude
          )
          verified = distance <= requirements.radiusMeters
        }
        break

      case 'qr_code':
        verified = body.code?.toUpperCase() === requirements.code?.toUpperCase()
        break

      case 'evidence_upload':
        verified = !!body.proofUrl
        break

      case 'manual':
        verified = true
        break
    }

    if (!verified && requirements.type !== 'manual') {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('user_quest_logs')
      .update({
        status: requirements.type === 'manual' ? 'in_progress' : 'completed',
        completed_at: requirements.type === 'manual' ? null : new Date().toISOString(),
        proof_url: body.proofUrl || null,
        xp_awarded: requirements.type === 'manual' ? 0 : quest.xp_reward,
        gold_awarded: requirements.type === 'manual' ? 0 : quest.gold_reward,
      })
      .eq('id', questLog.id)

    if (updateError) {
      throw updateError
    }

    if (requirements.type !== 'manual') {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('xp, gold, activity_streak, last_active_at')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        const lastActive = profile.last_active_at
          ? new Date(profile.last_active_at)
          : null
        const now = new Date()
        const daysSinceActive = lastActive
          ? Math.floor((now.getTime() - lastActive.getTime()) / 86400000)
          : 999

        let newStreak = profile.activity_streak
        if (daysSinceActive <= 1) {
          newStreak = daysSinceActive === 1 ? newStreak + 1 : newStreak
        } else {
          newStreak = 1
        }

        await supabase
          .from('user_profiles')
          .update({
            xp: profile.xp + quest.xp_reward,
            gold: profile.gold + quest.gold_reward,
            activity_streak: newStreak,
            last_active_at: now.toISOString(),
          })
          .eq('id', session.user.id)

        await supabase.from('activity_logs').insert({
          user_id: session.user.id,
          action_type: 'quest_completed',
          metadata: {
            quest_id: params.id,
            xp_earned: quest.xp_reward,
            gold_earned: quest.gold_reward,
          },
        })

        await redis.del(CACHE_KEYS.GUILD_LEADERBOARD)
      }
    }

    return NextResponse.json({
      success: true,
      xpAwarded: requirements.type === 'manual' ? 0 : quest.xp_reward,
      goldAwarded: requirements.type === 'manual' ? 0 : quest.gold_reward,
      pendingVerification: requirements.type === 'manual',
    })
  } catch (error) {
    console.error('Quest completion error:', error)
    return NextResponse.json(
      { error: 'Failed to complete quest' },
      { status: 500 }
    )
  }
}




