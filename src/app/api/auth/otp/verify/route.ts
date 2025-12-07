import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isOTPExpired } from '@/lib/2fa'

export async function POST(request: NextRequest) {
  try {
    const { email, code, purpose = 'login' } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    if (code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Find the OTP record
    const { data: otpRecord, error: fetchError } = await supabase
      .from('email_otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('purpose', purpose)
      .is('used_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Check if OTP is expired
    if (isOTPExpired(otpRecord.expires_at)) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Mark OTP as used
    await supabase
      .from('email_otp_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', otpRecord.id)

    // If this is for login with 2FA, create a session token
    if (purpose === 'login') {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('id, two_fa_method')
        .eq('email', email)
        .single()

      if (userProfile) {
        // Generate a verification token for completing login
        const verificationToken = crypto.randomUUID()
        
        // Store pending session
        await supabase
          .from('pending_2fa_sessions')
          .insert({
            user_id: userProfile.id,
            session_token: verificationToken,
            method: 'email',
          })

        return NextResponse.json({
          success: true,
          verified: true,
          verificationToken,
          message: 'Email verified successfully',
        })
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'Verification code accepted',
    })
  } catch (error) {
    console.error('OTP verify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

