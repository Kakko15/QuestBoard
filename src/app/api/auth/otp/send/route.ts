import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateEmailOTP, getOTPExpiration } from '@/lib/2fa'
import { sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, purpose = 'login' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate purpose
    const validPurposes = ['login', 'signup', '2fa_setup']
    if (!validPurposes.includes(purpose)) {
      return NextResponse.json(
        { error: 'Invalid purpose' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Check if email exists in auth (for login purpose)
    if (purpose === 'login') {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, email')
        .eq('email', email)
        .limit(1)

      if (!profiles || profiles.length === 0) {
        // Don't reveal if email exists or not for security
        return NextResponse.json({
          success: true,
          message: 'If this email is registered, you will receive a verification code.',
        })
      }
    }

    // Generate OTP
    const otp = generateEmailOTP()
    const expiresAt = getOTPExpiration()

    // Get user ID if exists
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single()

    // Store OTP in database
    // For signup, user_id might not exist yet, so we use a temporary UUID
    const userId = userProfile?.id || '00000000-0000-0000-0000-000000000000'
    
    const { error: insertError } = await supabase
      .from('email_otp_codes')
      .insert({
        user_id: userId,
        email,
        code: otp,
        purpose,
        expires_at: expiresAt.toISOString(),
      })

    if (insertError) {
      console.error('Error storing OTP:', insertError)
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      )
    }

    // Send OTP via email
    const emailSent = await sendOTPEmail({
      to: email,
      otp,
      purpose: purpose as 'login' | 'signup' | '2fa_setup',
    })

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      expiresAt: expiresAt.toISOString(),
    })
  } catch (error) {
    console.error('OTP send error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

