import nodemailer from 'nodemailer'

// Email transporter configuration
// For production, use your actual SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // For Gmail, use App Password
  },
})

interface SendOTPEmailParams {
  to: string
  otp: string
  purpose: 'login' | 'signup' | '2fa_setup'
  expiresInMinutes: number
}

export async function sendOTPEmail({ to, otp, purpose, expiresInMinutes }: SendOTPEmailParams) {
  const purposeText = {
    login: 'sign in to your account',
    signup: 'complete your registration',
    '2fa_setup': 'set up two-factor authentication',
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden;">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 20px; text-align: center;">
                  <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 40px;">🎮</span>
                  </div>
                  <h1 style="color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 8px;">QuestBoard</h1>
                  <p style="color: #9ca3af; font-size: 14px; margin: 0;">Your verification code is ready</p>
                </td>
              </tr>
              
              <!-- OTP Code -->
              <tr>
                <td style="padding: 20px 40px;">
                  <div style="background: rgba(139, 92, 246, 0.1); border: 2px dashed #8b5cf6; border-radius: 12px; padding: 30px; text-align: center;">
                    <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px;">Your OTP Code</p>
                    <div style="font-family: 'Courier New', monospace; font-size: 42px; font-weight: bold; color: #00ff88; letter-spacing: 8px; text-shadow: 0 0 20px rgba(0,255,136,0.5);">
                      ${otp}
                    </div>
                  </div>
                </td>
              </tr>
              
              <!-- Message -->
              <tr>
                <td style="padding: 20px 40px;">
                  <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin: 0; text-align: center;">
                    Use this code to <strong style="color: #ffffff;">${purposeText[purpose]}</strong>. 
                    This code will expire in <strong style="color: #f59e0b;">${expiresInMinutes} minutes</strong>.
                  </p>
                </td>
              </tr>
              
              <!-- Warning -->
              <tr>
                <td style="padding: 20px 40px 40px;">
                  <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 16px; border-radius: 0 8px 8px 0;">
                    <p style="color: #fca5a5; font-size: 13px; margin: 0;">
                      ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. QuestBoard staff will never ask for your OTP.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background: rgba(0,0,0,0.3); padding: 24px 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
                  <p style="color: #6b7280; font-size: 12px; margin: 0;">
                    This email was sent by QuestBoard 2025<br>
                    ISU-Echague Campus Gamified Engagement System
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const mailOptions = {
    from: `"QuestBoard 🎮" <${process.env.SMTP_USER || 'noreply@questboard.app'}>`,
    to,
    subject: `🔐 Your QuestBoard Verification Code: ${otp}`,
    html,
    text: `Your QuestBoard verification code is: ${otp}\n\nUse this code to ${purposeText[purpose]}. This code expires in ${expiresInMinutes} minutes.\n\nNever share this code with anyone.`,
  }

  try {
    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    return { success: false, error }
  }
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
