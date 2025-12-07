import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const createServerClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured')
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
      },
      from: () => ({
        select: () => ({ 
          eq: () => ({ single: async () => ({ data: null, error: null }) }),
          order: () => ({ limit: async () => ({ data: [], error: null }) }),
        }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
      }),
    } as any
  }
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

