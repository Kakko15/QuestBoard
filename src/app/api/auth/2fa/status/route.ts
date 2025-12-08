import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Check 2FA status
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('totp_enabled, two_fa_method')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching 2FA status:', error)
      return NextResponse.json(
        { error: 'Failed to fetch 2FA status' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      enabled: profile?.totp_enabled || !!profile?.two_fa_method,
      method: profile?.two_fa_method || null,
      totpEnabled: profile?.totp_enabled || false,
    })
  } catch (error) {
    console.error('2FA status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const { userId, code, method } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // For security, require current 2FA code to disable
    // This is optional but recommended
    
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({
        totp_enabled: false,
        totp_secret: null,
        two_fa_method: null,
      })
      .eq('id', userId)

    if (error) {
      console.error('Error disabling 2FA:', error)
      return NextResponse.json(
        { error: 'Failed to disable 2FA' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '2FA has been disabled',
    })
  } catch (error) {
    console.error('Disable 2FA error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




