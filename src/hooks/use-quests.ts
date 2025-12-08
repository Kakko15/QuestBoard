'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Quest, QuestDifficulty, UserQuestLog } from '@/types'

// Helper to transform database quest to Quest type
function transformQuest(quest: any): Quest {
  return {
    id: quest.id,
    title: quest.title,
    description: quest.description,
    shortDescription: quest.short_description,
    difficulty: quest.difficulty,
    xpReward: quest.xp_reward,
    goldReward: quest.gold_reward,
    requirements: quest.requirements,
    startsAt: quest.starts_at,
    expiresAt: quest.expires_at,
    maxParticipants: quest.max_participants,
    currentParticipants: quest.current_participants,
    createdById: quest.created_by_id,
    targetColleges: quest.target_colleges,
    isActive: quest.is_active,
    createdAt: quest.created_at,
    updatedAt: quest.updated_at,
  }
}

function transformQuestLog(log: any): UserQuestLog {
  return {
    id: log.id,
    oderId: log.user_id,
    questId: log.quest_id,
    status: log.status,
    startedAt: log.started_at,
    completedAt: log.completed_at,
    proofUrl: log.proof_url,
    verifiedById: log.verified_by_id,
    verifiedAt: log.verified_at,
    xpAwarded: log.xp_awarded,
    goldAwarded: log.gold_awarded,
    createdAt: log.created_at,
  }
}

interface UseQuestsOptions {
  difficulty?: QuestDifficulty | 'all'
  college?: string
  includeUserLogs?: boolean
}

interface QuestWithUserLog extends Quest {
  userLog?: UserQuestLog
}

export function useQuests(options: UseQuestsOptions = {}) {
  const [quests, setQuests] = useState<QuestWithUserLog[]>([])
  const [activeQuests, setActiveQuests] = useState<QuestWithUserLog[]>([])
  const [completedQuests, setCompletedQuests] = useState<QuestWithUserLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchQuests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query params
      const params = new URLSearchParams()
      if (options.difficulty && options.difficulty !== 'all') {
        params.append('difficulty', options.difficulty)
      }
      if (options.college) {
        params.append('college', options.college)
      }

      // Fetch quests from API
      const response = await fetch(`/api/quests?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch quests')
      }

      const transformedQuests = (data.quests || []).map(transformQuest)

      // If user is logged in and we want user logs, fetch them
      if (options.includeUserLogs) {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const { data: logs } = await supabase
            .from('user_quest_logs')
            .select('*')
            .eq('user_id', session.user.id)

          const logsMap = new Map(
            (logs || []).map((log: any) => [log.quest_id, transformQuestLog(log)])
          )

          // Attach user logs to quests
          const questsWithLogs = transformedQuests.map((quest: Quest) => ({
            ...quest,
            userLog: logsMap.get(quest.id),
          }))

          // Separate by status
          const available = questsWithLogs.filter((q: QuestWithUserLog) => !q.userLog)
          const active = questsWithLogs.filter((q: QuestWithUserLog) => q.userLog?.status === 'in_progress')
          const completed = questsWithLogs.filter((q: QuestWithUserLog) => q.userLog?.status === 'completed')

          // Also fetch completed quests that might be expired
          const { data: completedLogs } = await supabase
            .from('user_quest_logs')
            .select('*, quest:quests(*)')
            .eq('user_id', session.user.id)
            .eq('status', 'completed')

          const completedQuestsFromLogs = (completedLogs || []).map((log: any) => ({
            ...transformQuest(log.quest),
            userLog: transformQuestLog(log),
          }))

          setQuests(available)
          setActiveQuests(active)
          setCompletedQuests(completedQuestsFromLogs)
        } else {
          setQuests(transformedQuests)
          setActiveQuests([])
          setCompletedQuests([])
        }
      } else {
        setQuests(transformedQuests)
      }
    } catch (err) {
      console.error('Error fetching quests:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch quests')
    } finally {
      setLoading(false)
    }
  }, [supabase, options.difficulty, options.college, options.includeUserLogs])

  const acceptQuest = useCallback(async (questId: string) => {
    try {
      const response = await fetch(`/api/quests/${questId}/accept`, {
        method: 'POST',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept quest')
      }

      // Refresh quests after accepting
      await fetchQuests()
      return { success: true, questLog: data.questLog }
    } catch (err) {
      console.error('Error accepting quest:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to accept quest' 
      }
    }
  }, [fetchQuests])

  const completeQuest = useCallback(async (questId: string, proofUrl?: string) => {
    try {
      const response = await fetch(`/api/quests/${questId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proofUrl }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete quest')
      }

      // Refresh quests after completing
      await fetchQuests()
      return { success: true, rewards: data.rewards }
    } catch (err) {
      console.error('Error completing quest:', err)
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Failed to complete quest' 
      }
    }
  }, [fetchQuests])

  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])

  return {
    quests,
    activeQuests,
    completedQuests,
    loading,
    error,
    refresh: fetchQuests,
    acceptQuest,
    completeQuest,
  }
}


