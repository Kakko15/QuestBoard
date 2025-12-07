'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Mail, Smartphone, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OTPInput } from './otp-input'
import { useToast } from '@/hooks/use-toast'

interface TwoFactorVerifyProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  email: string
  userId?: string
  method: 'totp' | 'email'
  onVerified: (token: string) => void
}

export function TwoFactorVerify({ open, onOpenChange, email, userId, method, onVerified }: TwoFactorVerifyProps) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [internalUserId, setInternalUserId] = useState<string | undefined>(userId)
  const { toast } = useToast()

  // Send email OTP when dialog opens if email method
  useEffect(() => {
    if (open && method === 'email') {
      sendEmailOTP()
    }
    if (!open) {
      setOtp('')
    }
  }, [open, method])

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const sendEmailOTP = async () => {
    setLoading(true)
    try {
      // First get the userId if we don't have it
      if (!internalUserId) {
        const checkResponse = await fetch('/api/auth/2fa/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const checkData = await checkResponse.json()
        if (checkData.userId) {
          setInternalUserId(checkData.userId)
        }
      }

      const response = await fetch('/api/auth/2fa/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: internalUserId || userId, email, purpose: 'login' }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'OTP Sent',
          description: `Check your email at ${email}`,
        })
        setResendCooldown(60) // 60 second cooldown
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send OTP',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (otp.length !== 6) return
    setLoading(true)

    try {
      // Get userId if not available
      let currentUserId = internalUserId || userId
      if (!currentUserId) {
        const checkResponse = await fetch('/api/auth/2fa/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
        const checkData = await checkResponse.json()
        currentUserId = checkData.userId
        setInternalUserId(currentUserId)
      }

      const endpoint = method === 'totp' 
        ? '/api/auth/2fa/verify-totp' 
        : '/api/auth/2fa/verify-email-otp'

      const body = method === 'totp'
        ? { userId: currentUserId, code: otp, purpose: 'login' }
        : { userId: currentUserId, email, code: otp, purpose: 'login' }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      onVerified('verified')
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

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && !loading && open) {
      handleVerify()
    }
  }, [otp, open])

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border-2 border-neon-purple/30 bg-black/90 backdrop-blur-xl shadow-2xl shadow-neon-purple/20"
          >
            {/* Header */}
            <div className="relative text-center p-6 pb-4">
              <button
                onClick={() => onOpenChange(false)}
                className="absolute right-4 top-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-neon-purple to-neon-blue text-white shadow-lg shadow-neon-purple/30"
              >
                {method === 'totp' ? (
                  <Smartphone className="h-8 w-8" />
                ) : (
                  <Mail className="h-8 w-8" />
                )}
              </motion.div>
              <h2 className="font-display text-2xl font-bold text-white">
                Two-Factor Authentication
              </h2>
              <p className="text-gray-400 mt-2">
                {method === 'totp' 
                  ? 'Enter the code from your authenticator app'
                  : `Enter the code sent to ${email}`
                }
              </p>
            </div>

            {/* Content */}
            <div className="p-6 pt-2 space-y-6">
              <div className="space-y-4">
                <OTPInput
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                  autoFocus
                />

                {method === 'email' && (
                  <p className="text-center text-xs text-gray-500">
                    Code expires in 10 minutes
                  </p>
                )}
              </div>

              <Button
                onClick={handleVerify}
                disabled={otp.length !== 6 || loading}
                className="w-full bg-neon-green text-black hover:bg-neon-green/80 font-bold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify & Sign In
                  </>
                )}
              </Button>

              {method === 'email' && (
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={sendEmailOTP}
                    disabled={loading || resendCooldown > 0}
                    className="text-neon-purple"
                  >
                    {resendCooldown > 0 
                      ? `Resend in ${resendCooldown}s` 
                      : 'Resend Code'
                    }
                  </Button>
                </div>
              )}

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  {method === 'totp' 
                    ? "Can't access your authenticator? Contact support."
                    : "Didn't receive the email? Check your spam folder."
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
