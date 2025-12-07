import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOTPEmail, generateOTP } from '@/lib/email'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const OTP_EXPIRY_MINUTES = 10

export async function POST(request: NextRequest) {
  try {
    const { email, userId, purpose = 'login' } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    // Delete any existing unused OTPs for this email/purpose
    if (userId) {
      await supabaseAdmin
        .from('email_otp_codes')
        .delete()
        .eq('user_id', userId)
        .eq('purpose', purpose)
        .is('used_at', null)
    }

    // For signup, we might not have a userId yet - use email only
    const otpRecord: Record<string, unknown> = {
      email,
      code: otp,
      purpose,
      expires_at: expiresAt.toISOString(),
    }

    // Add user_id if available
    if (userId) {
      otpRecord.user_id = userId
    }

    // Store the OTP
    const { error: insertError } = await supabaseAdmin
      .from('email_otp_codes')
      .insert(otpRecord)

    if (insertError) {
      console.error('Error storing OTP:', insertError)
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      )
    }

    // Send the OTP email
    const emailResult = await sendOTPEmail({
      to: email,
      otp,
      purpose: purpose as 'login' | 'signup' | '2fa_setup',
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    })

    if (!emailResult.success) {
      // For development/testing, still return success but log the error
      console.warn('Email sending failed (dev mode):', emailResult.error)
      
      // In development, return the OTP for testing
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: `OTP sent to ${email}`,
          expiresIn: OTP_EXPIRY_MINUTES * 60,
          // Only include in development!
          _devOtp: otp,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${email}`,
      expiresIn: OTP_EXPIRY_MINUTES * 60, // seconds
    })
  } catch (error) {
    console.error('Send email OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

