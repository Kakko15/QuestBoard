'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Smartphone, 
  Mail, 
  CheckCircle2, 
  Copy, 
  Loader2,
  QrCode,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OTPInput } from './otp-input'
import { useToast } from '@/hooks/use-toast'

interface TwoFactorSetupProps {
  userId: string
  email: string
  onComplete: () => void
  onSkip?: () => void
}

type SetupStep = 'choose' | 'totp-qr' | 'totp-verify' | 'email-send' | 'email-verify' | 'complete'

export function TwoFactorSetup({ userId, email, onComplete, onSkip }: TwoFactorSetupProps) {
  const [step, setStep] = useState<SetupStep>('choose')
  const [method, setMethod] = useState<'totp' | 'email' | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleChooseMethod = async (selectedMethod: 'totp' | 'email') => {
    setMethod(selectedMethod)
    setLoading(true)

    try {
      if (selectedMethod === 'totp') {
        // Generate QR code for TOTP
        const response = await fetch('/api/auth/2fa/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to setup 2FA')
        }

        setQrCode(data.qrCode)
        setSecret(data.secret)
        setStep('totp-qr')
      } else {
        // Send email OTP
        const response = await fetch('/api/auth/2fa/send-email-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, email, purpose: '2fa_setup' }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to send OTP')
        }

        toast({
          title: 'OTP Sent!',
          description: `Check your email at ${email}`,
          variant: 'quest',
        })
        setStep('email-verify')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyTOTP = async () => {
    if (otp.length !== 6) return
    setLoading(true)

    try {
      const response = await fetch('/api/auth/2fa/verify-totp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: otp, purpose: 'setup' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code')
      }

      setStep('complete')
      toast({
        title: '2FA Enabled! 🛡️',
        description: 'Your account is now protected with Google Authenticator',
        variant: 'quest',
      })
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Invalid code',
        variant: 'destructive',
      })
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEmailOTP = async () => {
    if (otp.length !== 6) return
    setLoading(true)

    try {
      const response = await fetch('/api/auth/2fa/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, code: otp, purpose: '2fa_setup' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code')
      }

      setStep('complete')
      toast({
        title: '2FA Enabled! 🛡️',
        description: 'Your account is now protected with Email OTP',
        variant: 'quest',
      })
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Invalid or expired code',
        variant: 'destructive',
      })
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, purpose: '2fa_setup' }),
      })

      if (response.ok) {
        toast({
          title: 'OTP Resent',
          description: 'Check your email for the new code',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend OTP',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({ title: 'Copied!', description: 'Secret key copied to clipboard' })
    }
  }

  return (
    <Card className="w-full max-w-md border-2 border-neon-purple/30 bg-black/60 backdrop-blur-xl">
      <CardHeader className="text-center">
        <motion.div
          key={step}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neon-purple to-neon-pink text-3xl shadow-lg shadow-neon-purple/30"
        >
          {step === 'complete' ? '✅' : '🛡️'}
        </motion.div>
        <CardTitle className="font-display text-2xl text-white">
          {step === 'choose' && 'Enable Two-Factor Authentication'}
          {step === 'totp-qr' && 'Scan QR Code'}
          {step === 'totp-verify' && 'Verify Setup'}
          {step === 'email-verify' && 'Verify Email OTP'}
          {step === 'complete' && '2FA Enabled!'}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {step === 'choose' && 'Add an extra layer of security to your account'}
          {step === 'totp-qr' && 'Use Google Authenticator or similar app'}
          {step === 'totp-verify' && 'Enter the 6-digit code from your authenticator app'}
          {step === 'email-verify' && 'Enter the code sent to your email'}
          {step === 'complete' && 'Your account is now protected'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AnimatePresence mode="wait">
          {/* Choose Method */}
          {step === 'choose' && (
            <motion.div
              key="choose"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <button
                onClick={() => handleChooseMethod('totp')}
                disabled={loading}
                className="w-full p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:border-neon-green/50 hover:bg-neon-green/5 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neon-green/20 text-neon-green group-hover:bg-neon-green/30 transition-colors">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white">Google Authenticator</div>
                    <div className="text-sm text-gray-400">Use an authenticator app for codes</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-neon-green transition-colors" />
                </div>
              </button>

              <button
                onClick={() => handleChooseMethod('email')}
                disabled={loading}
                className="w-full p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:border-neon-purple/50 hover:bg-neon-purple/5 transition-all group text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neon-purple/20 text-neon-purple group-hover:bg-neon-purple/30 transition-colors">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-white">Email OTP</div>
                    <div className="text-sm text-gray-400">Receive codes via email (10 min expiry)</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-neon-purple transition-colors" />
                </div>
              </button>

              {onSkip && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="w-full text-gray-500 hover:text-white"
                >
                  Skip for now
                </Button>
              )}
            </motion.div>
          )}

          {/* TOTP QR Code */}
          {step === 'totp-qr' && (
            <motion.div
              key="totp-qr"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {qrCode && (
                <div className="flex justify-center">
                  <div className="p-4 bg-black rounded-2xl border-2 border-neon-green/30 shadow-lg shadow-neon-green/10">
                    <Image
                      src={qrCode}
                      alt="2FA QR Code"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-400">Or enter this key manually:</p>
                <div className="flex items-center justify-center gap-2">
                  <code className="px-3 py-2 bg-black/60 rounded-lg text-neon-green font-mono text-sm border border-white/10">
                    {secret?.match(/.{1,4}/g)?.join(' ')}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={copySecret}
                    className="h-8 w-8"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4 text-neon-green" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setStep('choose')}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep('totp-verify')}
                  className="flex-1 bg-neon-green text-black hover:bg-neon-green/80"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* TOTP Verify */}
          {step === 'totp-verify' && (
            <motion.div
              key="totp-verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <p className="text-sm text-gray-400">
                  Enter the 6-digit code from Google Authenticator
                </p>
              </div>

              <OTPInput
                value={otp}
                onChange={setOtp}
                disabled={loading}
              />

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => { setStep('totp-qr'); setOtp('') }}
                  disabled={loading}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleVerifyTOTP}
                  disabled={otp.length !== 6 || loading}
                  className="flex-1 bg-neon-green text-black hover:bg-neon-green/80"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Verify
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Email Verify */}
          {step === 'email-verify' && (
            <motion.div
              key="email-verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <p className="text-sm text-gray-400">
                  We sent a code to <span className="text-neon-purple font-medium">{email}</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Code expires in 10 minutes
                </p>
              </div>

              <OTPInput
                value={otp}
                onChange={setOtp}
                disabled={loading}
              />

              <Button
                onClick={handleVerifyEmailOTP}
                disabled={otp.length !== 6 || loading}
                className="w-full bg-neon-purple text-white hover:bg-neon-purple/80"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Verify Code
                    <CheckCircle2 className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <Button
                  variant="ghost"
                  onClick={() => { setStep('choose'); setOtp('') }}
                  disabled={loading}
                  className="text-gray-500"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-neon-purple"
                >
                  Resend Code
                </Button>
              </div>
            </motion.div>
          )}

          {/* Complete */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="h-20 w-20 rounded-full bg-neon-green/20 flex items-center justify-center"
                >
                  <CheckCircle2 className="h-10 w-10 text-neon-green" />
                </motion.div>
              </div>

              <div>
                <p className="text-white font-medium mb-2">
                  {method === 'totp' ? 'Google Authenticator' : 'Email OTP'} is now active
                </p>
                <p className="text-sm text-gray-400">
                  You'll need to verify your identity when signing in from a new device
                </p>
              </div>

              <Button
                onClick={onComplete}
                className="w-full bg-neon-green text-black hover:bg-neon-green/80 font-bold"
              >
                Continue to QuestBoard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
