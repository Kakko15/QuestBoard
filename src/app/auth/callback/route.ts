import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && session?.user) {
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (!existingProfile) {
        const metadata = session.user.user_metadata
        const email = session.user.email || ''
        const fullName = metadata?.full_name || metadata?.name || ''
        const nameParts = fullName.split(' ')
        const firstName = nameParts[0] || email.split('@')[0]
        const lastName = nameParts.slice(1).join(' ') || ''

        await supabase.from('user_profiles').insert({
          id: session.user.id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          student_id: `OAUTH-${session.user.id.substring(0, 8)}`,
          college: 'CCSICT',
          role: 'player',
          xp: 0,
          gold: 100,
          level: 1,
          activity_streak: 0,
          avatar_url: metadata?.avatar_url || metadata?.picture || null,
        })
      }
    }
  }

  return NextResponse.redirect(new URL('/', requestUrl.origin))
}







