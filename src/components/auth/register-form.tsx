'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ReCAPTCHA from 'react-google-recaptcha'
import { Mail, Lock, User, Hash, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GuildBadge } from '@/components/game/guild-badge'
import { GUILDS } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { CollegeEnum } from '@/types'

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.619 -21.864 51.659 -21.864 50.669 C -21.864 49.679 -21.734 48.719 -21.484 47.799 L -21.484 44.709 L -25.464 44.709 C -26.284 46.329 -26.754 48.159 -26.754 50.669 C -26.754 53.179 -26.284 55.009 -25.464 56.619 L -21.484 53.529 Z" />
        <path fill="#EA4335" d="M -14.754 42.849 C -12.994 42.849 -11.404 43.459 -10.154 44.649 L -6.724 41.219 C -8.804 39.279 -11.514 38.099 -14.754 38.099 C -19.444 38.099 -23.494 40.799 -25.464 44.709 L -21.484 47.799 C -20.534 44.949 -17.884 42.849 -14.754 42.849 Z" />
      </g>
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  )
}

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    studentId: '',
    college: '' as CollegeEnum | '',
  })
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token)
  }

  const handleCaptchaExpired = () => {
    setCaptchaToken(null)
  }

  const handleOAuthSignUp = async (provider: 'google' | 'discord') => {
    setOauthLoading(provider)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast({
          title: 'Sign Up Failed',
          description: error.message,
          variant: 'destructive',
        })
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setOauthLoading(null)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!captchaToken) {
      toast({
        title: 'Captcha Required',
        description: 'Please complete the reCAPTCHA verification',
        variant: 'destructive',
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      })
      return
    }

    if (!formData.college) {
      toast({
        title: 'College Required',
        description: 'Please select your college/department',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            student_id: formData.studentId,
            college: formData.college,
          },
        },
      })

      if (authError) {
        toast({
          title: 'Registration Failed',
          description: authError.message,
          variant: 'destructive',
        })
        return
      }

      if (authData.user) {
        const { error: profileError } = await supabase.from('user_profiles').insert({
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          student_id: formData.studentId,
          college: formData.college,
          role: 'player',
          xp: 0,
          gold: 100,
          level: 1,
          activity_streak: 0,
        })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }
      }

      toast({
        title: 'Welcome, New Adventurer!',
        description: `You have joined ${GUILDS[formData.college as CollegeEnum].guildName}!`,
        variant: 'quest',
      })

      router.push('/')
      router.refresh()
    } catch (err) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
      recaptchaRef.current?.reset()
      setCaptchaToken(null)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full max-w-md border-2 border-amber-500/20">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-3xl shadow-lg"
          >
            🛡️
          </motion.div>
          <CardTitle className="font-display text-2xl">
            Join QuestBoard
          </CardTitle>
          <CardDescription>
            Create your adventurer profile and choose your guild
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleOAuthSignUp('google')}
              disabled={oauthLoading !== null}
              className="w-full"
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 h-4 w-4" />
              )}
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthSignUp('discord')}
              disabled={oauthLoading !== null}
              className="w-full"
            >
              {oauthLoading === 'discord' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DiscordIcon className="mr-2 h-4 w-4" />
              )}
              Discord
            </Button>
          </div>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              or register with email
            </span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="Juan"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Dela Cruz"
                  value={formData.lastName}
                  onChange={(e) => updateField('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="studentId"
                  placeholder="20-12345"
                  value={formData.studentId}
                  onChange={(e) => updateField('studentId', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">College / Department</Label>
              <Select
                value={formData.college}
                onValueChange={(value) => updateField('college', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your guild..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GUILDS).map(([key, guild]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{guild.icon}</span>
                        <span>{guild.guildName}</span>
                        <span className="text-xs text-muted-foreground">
                          ({guild.acronym})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.college && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-lg border border-border/50 bg-card p-3"
              >
                <GuildBadge college={formData.college as CollegeEnum} size="md" />
              </motion.div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">ISU Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@isu.edu.ph"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  className="pl-10"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  className="pl-10"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {RECAPTCHA_SITE_KEY && (
              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={handleCaptchaChange}
                  onExpired={handleCaptchaExpired}
                  theme="dark"
                />
              </div>
            )}

            <Button
              type="submit"
              variant="quest"
              className="w-full"
              disabled={loading || (!captchaToken && !!RECAPTCHA_SITE_KEY)}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Character...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Character
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <a
              href="/auth/login"
              className="font-medium text-amber-500 hover:underline"
            >
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

