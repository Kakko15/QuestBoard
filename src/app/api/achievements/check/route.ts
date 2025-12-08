import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Achievement definitions with their unlock conditions
const ACHIEVEMENT_DEFINITIONS = [
  {
    name: 'First Steps',
    description: 'Complete your first quest',
    icon: '🎯',
    xpBonus: 50,
    check: async (supabase: any, userId: string) => {
      const { count } = await supabase
        .from('user_quest_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')
      return (count || 0) >= 1
    },
  },
  {
    name: 'Dedicated',
    description: 'Maintain a 7-day activity streak',
    icon: '🔥',
    xpBonus: 100,
    check: async (supabase: any, userId: string) => {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('activity_streak')
        .eq('id', userId)
        .single()
      return (profile?.activity_streak || 0) >= 7
    },
  },
  {
    name: 'Scholar',
    description: 'Complete 10 quests',
    icon: '📚',
    xpBonus: 150,
    check: async (supabase: any, userId: string) => {
      const { count } = await supabase
        .from('user_quest_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')
      return (count || 0) >= 10
    },
  },
  {
    name: 'Quest Master',
    description: 'Complete 50 quests',
    icon: '⚔️',
    xpBonus: 500,
    check: async (supabase: any, userId: string) => {
      const { count } = await supabase
        .from('user_quest_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'completed')
      return (count || 0) >= 50
    },
  },
  {
    name: 'Gold Collector',
    description: 'Accumulate 1000 gold',
    icon: '💰',
    xpBonus: 100,
    check: async (supabase: any, userId: string) => {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('gold')
        .eq('id', userId)
        .single()
      return (profile?.gold || 0) >= 1000
    },
  },
  {
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: '⭐',
    xpBonus: 200,
    check: async (supabase: any, userId: string) => {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('level')
        .eq('id', userId)
        .single()
      return (profile?.level || 0) >= 10
    },
  },
  {
    name: 'Legend',
    description: 'Reach level 25',
    icon: '🏆',
    xpBonus: 500,
    check: async (supabase: any, userId: string) => {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('level')
        .eq('id', userId)
        .single()
      return (profile?.level || 0) >= 25
    },
  },
  {
    name: 'Early Bird',
    description: 'Complete a quest before 8 AM',
    icon: '🌅',
    xpBonus: 75,
    check: async (supabase: any, userId: string) => {
      const { data: logs } = await supabase
        .from('user_quest_logs')
        .select('completed_at')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .not('completed_at', 'is', null)
      
      return logs?.some((log: any) => {
        const hour = new Date(log.completed_at).getHours()
        return hour < 8
      }) || false
    },
  },
]

export async function POST() {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const unlockedAchievements: string[] = []

    // Get user's current achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, achievement:achievements(name)')
      .eq('user_id', userId)

    const unlockedNames = new Set(
      userAchievements?.map((ua: any) => ua.achievement?.name) || []
    )

    // Check each achievement
    for (const achievement of ACHIEVEMENT_DEFINITIONS) {
      // Skip if already unlocked
      if (unlockedNames.has(achievement.name)) continue

      // Check if condition is met
      const isUnlocked = await achievement.check(supabase, userId)

      if (isUnlocked) {
        // Get or create achievement in database
        let { data: achievementRecord } = await supabase
          .from('achievements')
          .select('id')
          .eq('name', achievement.name)
          .single()

        if (!achievementRecord) {
          // Create achievement if it doesn't exist
          const { data: newAchievement } = await supabase
            .from('achievements')
            .insert({
              name: achievement.name,
              description: achievement.description,
              icon_url: achievement.icon,
              xp_bonus: achievement.xpBonus,
              requirement: {},
            })
            .select('id')
            .single()
          achievementRecord = newAchievement
        }

        if (achievementRecord) {
          // Award achievement to user
          await supabase.from('user_achievements').insert({
            user_id: userId,
            achievement_id: achievementRecord.id,
          })

          // Award XP bonus
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('xp')
            .eq('id', userId)
            .single()

          if (profile) {
            await supabase
              .from('user_profiles')
              .update({ xp: profile.xp + achievement.xpBonus })
              .eq('id', userId)
          }

          // Create notification
          await supabase.from('notifications').insert({
            user_id: userId,
            title: 'Achievement Unlocked! 🏆',
            message: `You earned "${achievement.name}" - ${achievement.description}. +${achievement.xpBonus} XP bonus!`,
            type: 'achievement',
          })

          unlockedAchievements.push(achievement.name)
        }
      }
    }

    return NextResponse.json({
      success: true,
      newAchievements: unlockedAchievements,
    })
  } catch (error) {
    console.error('Achievement check error:', error)
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    )
  }
}


