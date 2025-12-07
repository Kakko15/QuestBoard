import { NextRequest, NextResponse } from 'next/server'
import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Create a Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    // Generate a new TOTP secret
    const secret = authenticator.generateSecret()
    
    // Create the otpauth URL for QR code
    const otpauthUrl = authenticator.keyuri(
      email,
      'QuestBoard',
      secret
    )

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#00ff88',
        light: '#0a0a0a',
      },
    })

    // Store the secret temporarily (not enabled yet)
    // The secret will be saved permanently when user verifies
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ totp_secret: secret })
      .eq('id', userId)

    if (error) {
      console.error('Error storing TOTP secret:', error)
      return NextResponse.json(
        { error: 'Failed to setup 2FA' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      qrCode: qrCodeDataUrl,
      secret, // Also return secret for manual entry
      message: 'Scan the QR code with Google Authenticator',
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
