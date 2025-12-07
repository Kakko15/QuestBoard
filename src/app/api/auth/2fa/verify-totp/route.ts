import { NextRequest, NextResponse } from 'next/server'
import { authenticator } from 'otplib'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Configure authenticator with a window of 1 (allows for time drift)
authenticator.options = {
  window: 1,
}

export async function POST(request: NextRequest) {
  try {
    const { userId, code, purpose } = await request.json()

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'User ID and code are required' },
        { status: 400 }
      )
    }

    // Get user's TOTP secret
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('totp_secret, totp_enabled')
      .eq('id', userId)
      .single()

    if (profileError || !profile?.totp_secret) {
      return NextResponse.json(
        { error: '2FA is not set up for this user' },
        { status: 400 }
      )
    }

    // Verify the TOTP code
    const isValid = authenticator.verify({
      token: code,
      secret: profile.totp_secret,
    })

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // If this is for setup verification, enable TOTP
    if (purpose === 'setup') {
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          totp_enabled: true,
          two_fa_method: 'totp',
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Error enabling TOTP:', updateError)
        return NextResponse.json(
          { error: 'Failed to enable 2FA' },
          { status: 500 }
        )
      }
    }

    // If this is for login verification, clear the pending session
    if (purpose === 'login') {
      await supabaseAdmin
        .from('pending_2fa_sessions')
        .delete()
        .eq('user_id', userId)
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: purpose === 'setup' ? '2FA has been enabled successfully' : 'Verification successful',
    })
  } catch (error) {
    console.error('TOTP verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

