'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Shield, 
  Smartphone, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/layout/navbar'
import { TwoFactorSetup } from '@/components/auth/two-factor-setup'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { UserProfile } from '@/types'

export default function SecuritySettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [twoFAStatus, setTwoFAStatus] = useState<{
    enabled: boolean
    method: 'totp' | 'email' | null
  }>({ enabled: false, method: null })
  const [showSetup, setShowSetup] = useState(false)
  const [disabling, setDisabling] = useState(false)
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
        .select('*')
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

        // Fetch 2FA status
        const response = await fetch(`/api/auth/2fa/status?userId=${profile.id}`)
        const data = await response.json()
        setTwoFAStatus({
          enabled: data.enabled,
          method: data.method,
        })
      }
      setLoading(false)
    }

    fetchUser()
  }, [supabase, router])

  const handleDisable2FA = async () => {
    if (!user) return
    
    setDisabling(true)
    try {
      const response = await fetch('/api/auth/2fa/status', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        setTwoFAStatus({ enabled: false, method: null })
        toast({
          title: '2FA Disabled',
          description: 'Two-factor authentication has been disabled',
        })
      } else {
        throw new Error('Failed to disable 2FA')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disable 2FA',
        variant: 'destructive',
      })
    } finally {
      setDisabling(false)
    }
  }

  const handleSetupComplete = () => {
    setShowSetup(false)
    setTwoFAStatus({ enabled: true, method: 'totp' }) // Will be updated on next fetch
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neon-purple" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="scanline" />
      <Navbar user={user} onSignOut={async () => { await supabase.auth.signOut(); router.push('/') }} />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <Link 
            href="/profile" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Link>

          <h1 className="font-display text-4xl font-bold mb-2">
            Security Settings
          </h1>
          <p className="text-gray-400 mb-8">
            Manage your account security and two-factor authentication
          </p>

          {showSetup ? (
            <TwoFactorSetup
              userId={user.id}
              email={user.email}
              onComplete={handleSetupComplete}
              onSkip={() => setShowSetup(false)}
            />
          ) : (
            <div className="space-y-6">
              {/* 2FA Status Card */}
              <Card className="border-2 border-white/10 bg-black/40">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${twoFAStatus.enabled ? 'bg-neon-green/20' : 'bg-yellow-500/20'}`}>
                        <Shield className={`h-6 w-6 ${twoFAStatus.enabled ? 'text-neon-green' : 'text-yellow-500'}`} />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Two-Factor Authentication</CardTitle>
                        <CardDescription>
                          {twoFAStatus.enabled 
                            ? 'Your account is protected with 2FA' 
                            : 'Add an extra layer of security'
                          }
                        </CardDescription>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      twoFAStatus.enabled 
                        ? 'bg-neon-green/20 text-neon-green' 
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {twoFAStatus.enabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {twoFAStatus.enabled ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                        {twoFAStatus.method === 'totp' ? (
                          <>
                            <Smartphone className="h-5 w-5 text-neon-green" />
                            <div>
                              <div className="font-medium">Google Authenticator</div>
                              <div className="text-sm text-gray-400">Using authenticator app for codes</div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-neon-green ml-auto" />
                          </>
                        ) : (
                          <>
                            <Mail className="h-5 w-5 text-neon-purple" />
                            <div>
                              <div className="font-medium">Email OTP</div>
                              <div className="text-sm text-gray-400">Codes sent to {user.email}</div>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-neon-green ml-auto" />
                          </>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                          <div>
                            <div className="font-medium text-red-400">Disable 2FA</div>
                            <div className="text-sm text-gray-400 mb-3">
                              This will make your account less secure. Only disable if you need to switch methods.
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDisable2FA}
                              disabled={disabling}
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              {disabling ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <XCircle className="mr-2 h-4 w-4" />
                              )}
                              Disable 2FA
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-gray-400">
                        Two-factor authentication adds an extra layer of security to your account. 
                        When enabled, you'll need to enter a code from your authenticator app or email 
                        in addition to your password when signing in.
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <Smartphone className="h-6 w-6 text-neon-green mb-2" />
                          <div className="font-medium">Google Authenticator</div>
                          <div className="text-sm text-gray-400">More secure, works offline</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <Mail className="h-6 w-6 text-neon-purple mb-2" />
                          <div className="font-medium">Email OTP</div>
                          <div className="text-sm text-gray-400">Codes expire in 10 minutes</div>
                        </div>
                      </div>

                      <Button
                        onClick={() => setShowSetup(true)}
                        className="w-full bg-neon-green text-black hover:bg-neon-green/80 font-bold"
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Enable Two-Factor Authentication
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Info Card */}
              <Card className="border-2 border-white/10 bg-black/40">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-gray-400">Email</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/10">
                    <span className="text-gray-400">Account Created</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400">Guild</span>
                    <span className="font-medium">{user.college}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
}



