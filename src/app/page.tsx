'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useUser } from '@/hooks/use-user'

export default function RootPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (user && (user.role === 'quest_giver' || user.role === 'game_master')) {
      router.replace('/admin')
    } else {
      // Both guests and players go to quests page
      // Or if you want to show welcome page for first-time visitors:
      const welcomed = typeof window !== 'undefined' ? localStorage.getItem('questboard_welcomed') : null
      
      if (!welcomed && !user) {
        router.replace('/welcome')
      } else {
        router.replace('/quests')
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
    </div>
  )
}
