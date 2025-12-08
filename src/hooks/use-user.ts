'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile } from '@/types'

// Transform database profile to UserProfile type
function transformProfile(profile: any): UserProfile {
  return {
    id: profile.id,
    email: profile.email,
    studentId: profile.student_id,
    firstName: profile.first_name,
    lastName: profile.last_name,
    college: profile.college,
    role: profile.role,
    xp: profile.xp,
    gold: profile.gold,
    level: profile.level,
    avatarUrl: profile.avatar_url,
    activityStreak: profile.activity_streak,
    lastActiveAt: profile.last_active_at,
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  const fetchUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser(transformProfile(profile))
        } else {
          setUser(null)
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [supabase])

  const refreshUser = useCallback(async () => {
    setLoading(true)
    await fetchUser()
  }, [fetchUser])

  useEffect(() => {
    fetchUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setLoading(false)
      } else if (session?.user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          setUser(transformProfile(profile))
        }
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchUser])

  return { user, loading, signOut, refreshUser }
}
