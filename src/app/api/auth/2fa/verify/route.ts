import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { verifyTOTP } from '@/lib/2fa'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's TOTP secret
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('totp_secret, totp_enabled')
      .eq('id', user.id)
      .single()

    if (!profile?.totp_secret) {
      return NextResponse.json(
        { error: '2FA not set up. Please run setup first.' },
        { status: 400 }
      )
    }

    // Verify the TOTP code
    const isValid = verifyTOTP(code, profile.totp_secret)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Enable TOTP for the user
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        totp_enabled: true,
        two_fa_method: 'totp'
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error enabling 2FA:', updateError)
      return NextResponse.json(
        { error: 'Failed to enable 2FA' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication enabled successfully!',
    })
  } catch (error) {
    console.error('2FA verify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

