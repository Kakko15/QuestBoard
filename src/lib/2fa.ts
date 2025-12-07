import { authenticator } from 'otplib'
import QRCode from 'qrcode'

// Configure TOTP settings
authenticator.options = {
  digits: 6,
  step: 30, // 30 seconds
  window: 1, // Allow 1 step before/after for clock drift
}

export const APP_NAME = 'QuestBoard'

// Generate a new TOTP secret
export function generateTOTPSecret(): string {
  return authenticator.generateSecret()
}

// Generate TOTP URI for QR code
export function generateTOTPUri(email: string, secret: string): string {
  return authenticator.keyuri(email, APP_NAME, secret)
}

// Generate QR code as data URL
export async function generateQRCode(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  })
}

// Verify TOTP token
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch {
    return false
  }
}

// Generate a random 6-digit OTP for email
export function generateEmailOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Calculate expiration time (10 minutes from now)
export function getOTPExpiration(): Date {
  const expiration = new Date()
  expiration.setMinutes(expiration.getMinutes() + 10)
  return expiration
}

// Check if OTP is expired
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt)
}

