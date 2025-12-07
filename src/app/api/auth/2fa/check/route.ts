import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Check if a user has 2FA enabled (by email - for pre-login check)
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Find the user profile by email
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, totp_enabled, two_fa_method')
      .eq('email', email)
      .single()

    if (error || !profile) {
      // User not found - no 2FA (or invalid user)
      return NextResponse.json({
        has2FA: false,
        method: null,
      })
    }

    const has2FA = profile.totp_enabled || !!profile.two_fa_method

    return NextResponse.json({
      has2FA,
      method: profile.two_fa_method || (profile.totp_enabled ? 'totp' : null),
      userId: has2FA ? profile.id : null, // Only return userId if 2FA is enabled
    })
  } catch (error) {
    console.error('2FA check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
