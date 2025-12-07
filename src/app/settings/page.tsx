'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Check, 
  X, 
  Loader2, 
  ArrowLeft,
  AlertTriangle 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { TwoFactorSetup } from '@/components/auth/two-factor-setup'
import { OTPInput } from '@/components/auth/otp-input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { UserProfile } from '@/types'
import Link from 'next/link'

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [twoFAMethod, setTwoFAMethod] = useState<string | null>(null)
  const [showSetup, setShowSetup] = useState(false)
  const [showDisable, setShowDisable] = useState(false)
  const [disableLoading, setDisableLoading] = useState(false)
  const [disableError, setDisableError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*, totp_enabled, two_fa_method')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          studentId: profile.student_id,
          firstName: profile.first_name,
          lastName: profile.last_name,
          college: profile.college,
          role: profile.role,
          xp: profile.xp,
          gold: profile.gold,
          level: profile.level,
          avatarUrl: profile.avatar_url,
          activityStreak: profile.activity_streak,
          lastActiveAt: profile.last_active_at,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        })
        setTwoFAEnabled(profile.totp_enabled || profile.two_fa_method === 'email')
        setTwoFAMethod(profile.two_fa_method)
      }
      setLoading(false)
    }

    fetchUser()
  }, [supabase, router])

  const handleDisable2FA = async (code: string) => {
    setDisableLoading(true)
    setDisableError(null)

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to disable 2FA')
      }

      setTwoFAEnabled(false)
      setTwoFAMethod(null)
      setShowDisable(false)
      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled',
      })
    } catch (err) {
      setDisableError(err instanceof Error ? err.message : 'Failed to disable 2FA')
    } finally {
      setDisableLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="scanline" />
      <Navbar user={user} onSignOut={async () => { await supabase.auth.signOut(); router.push('/'); }} />

      <main className="container mx-auto px-4 pt-32 pb-20">
        <Link 
          href="/profile" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl"
        >
          <h1 className="font-display text-4xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400 mb-8">Manage your account security</p>

          {/* Security Section */}
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-neon-green" />
                Security
              </CardTitle>
              <CardDescription>
                Protect your account with two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 2FA Status */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-4">
                  {twoFAMethod === 'totp' ? (
                    <div className="p-2 rounded-lg bg-neon-purple/20">
                      <Smartphone className="h-6 w-6 text-neon-purple" />
                    </div>
                  ) : twoFAMethod === 'email' ? (
                    <div className="p-2 rounded-lg bg-neon-blue/20">
                      <Mail className="h-6 w-6 text-neon-blue" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-gray-500/20">
                      <Shield className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-400">
                      {twoFAEnabled 
                        ? `Enabled via ${twoFAMethod === 'totp' ? 'Authenticator App' : 'Email'}`
                        : 'Not enabled'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {twoFAEnabled ? (
                    <>
                      <div className="flex items-center gap-1 text-neon-green text-sm">
                        <Check className="h-4 w-4" />
                        Active
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDisable(true)}
                        className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                      >
                        Disable
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setShowSetup(true)}
                      className="bg-neon-green text-black hover:bg-neon-green/80"
                    >
                      Enable 2FA
                    </Button>
                  )}
                </div>
              </div>

              {/* 2FA Benefits */}
              {!twoFAEnabled && (
                <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-500 mb-1">
                        Secure Your Account
                      </h4>
                      <p className="text-sm text-gray-400">
                        Two-factor authentication adds an extra layer of security. 
                        Even if someone knows your password, they won't be able to 
                        access your account without the verification code.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2FA Methods Info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="h-4 w-4 text-neon-purple" />
                    <h4 className="font-bold text-sm">Authenticator App</h4>
                  </div>
                  <p className="text-xs text-gray-400">
                    Use Google Authenticator, Authy, or similar apps for 
                    time-based codes that change every 30 seconds.
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-neon-blue" />
                    <h4 className="font-bold text-sm">Email OTP</h4>
                  </div>
                  <p className="text-xs text-gray-400">
                    Receive a 6-digit code via email each time you log in. 
                    Codes expire after 10 minutes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />

      {/* 2FA Setup Dialog */}
      <TwoFactorSetup
        open={showSetup}
        onOpenChange={setShowSetup}
        onSuccess={() => {
          setTwoFAEnabled(true)
          setTwoFAMethod('totp')
        }}
      />

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisable} onOpenChange={setShowDisable}>
        <DialogContent className="glass-card border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Shield className="h-5 w-5" />
              Disable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your verification code to disable 2FA. This will make your account less secure.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <p className="text-sm text-gray-400 text-center">
              Enter the 6-digit code from your authenticator app
            </p>

            <OTPInput
              onComplete={handleDisable2FA}
              disabled={disableLoading}
              error={!!disableError}
            />

            {disableError && (
              <p className="text-center text-sm text-red-400">{disableError}</p>
            )}

            {disableLoading && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-red-400" />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

