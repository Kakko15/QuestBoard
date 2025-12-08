import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { email, code, userId, purpose = 'login' } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // Find the OTP record
    let query = supabaseAdmin
      .from('email_otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('purpose', purpose)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    const { data: otpRecords, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching OTP:', fetchError)
      return NextResponse.json(
        { error: 'Failed to verify OTP' },
        { status: 500 }
      )
    }

    if (!otpRecords || otpRecords.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP code' },
        { status: 400 }
      )
    }

    const otpRecord = otpRecords[0]

    // Mark the OTP as used
    const { error: updateError } = await supabaseAdmin
      .from('email_otp_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', otpRecord.id)

    if (updateError) {
      console.error('Error marking OTP as used:', updateError)
    }

    // If this is for 2FA setup, enable email 2FA
    if (purpose === '2fa_setup' && userId) {
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          two_fa_method: 'email',
        })
        .eq('id', userId)

      if (profileError) {
        console.error('Error enabling email 2FA:', profileError)
        return NextResponse.json(
          { error: 'Failed to enable 2FA' },
          { status: 500 }
        )
      }
    }

    // If this is for login verification, clear the pending session
    if (purpose === 'login' && userId) {
      await supabaseAdmin
        .from('pending_2fa_sessions')
        .delete()
        .eq('user_id', userId)
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'OTP verified successfully',
    })
  } catch (error) {
    console.error('Verify email OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




