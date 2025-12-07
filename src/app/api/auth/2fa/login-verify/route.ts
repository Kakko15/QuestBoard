import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTOTP } from '@/lib/2fa'

// Verify 2FA during login
export async function POST(request: NextRequest) {
  try {
    const { email, code, method } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get user profile with 2FA info
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, totp_secret, totp_enabled, two_fa_method')
      .eq('email', email)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    let isValid = false

    if (method === 'totp' && profile.totp_enabled && profile.totp_secret) {
      // Verify TOTP code
      isValid = verifyTOTP(code, profile.totp_secret)
    } else if (method === 'email') {
      // Verify email OTP
      const { data: otpRecord } = await supabase
        .from('email_otp_codes')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('purpose', 'login')
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (otpRecord) {
        isValid = true
        // Mark OTP as used
        await supabase
          .from('email_otp_codes')
          .update({ used_at: new Date().toISOString() })
          .eq('id', otpRecord.id)
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Generate a session verification token
    const verificationToken = crypto.randomUUID()

    // Clean up old pending sessions for this user
    await supabase
      .from('pending_2fa_sessions')
      .delete()
      .eq('user_id', profile.id)

    // Store new pending session
    await supabase
      .from('pending_2fa_sessions')
      .insert({
        user_id: profile.id,
        session_token: verificationToken,
        method: method || 'totp',
      })

    return NextResponse.json({
      success: true,
      verified: true,
      verificationToken,
      userId: profile.id,
      message: '2FA verification successful',
    })
  } catch (error) {
    console.error('2FA login verify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

