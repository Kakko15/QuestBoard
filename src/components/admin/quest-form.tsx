'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Scroll,
  MapPin,
  QrCode,
  Camera,
  Sparkles,
  Calendar,
  Users,
  Target,
  Loader2,
  X,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { DIFFICULTY_CONFIG, GUILDS } from '@/lib/constants'
import { generateQrCode } from '@/lib/utils'
import type { QuestDifficulty, CollegeEnum, VerificationType } from '@/types'

interface QuestFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface QuestFormData {
  title: string
  description: string
  shortDescription: string
  difficulty: QuestDifficulty
  xpReward: number
  goldReward: number
  verificationType: VerificationType
  // GPS requirements
  latitude: string
  longitude: string
  radiusMeters: string
  // QR Code
  qrCode: string
  // Evidence
  evidenceDescription: string
  // Manual
  manualInstructions: string
  // Dates
  startsAt: string
  expiresAt: string
  // Participants
  maxParticipants: string
  // Target colleges
  targetColleges: CollegeEnum[]
}

const initialFormData: QuestFormData = {
  title: '',
  description: '',
  shortDescription: '',
  difficulty: 'common',
  xpReward: 100,
  goldReward: 50,
  verificationType: 'manual',
  latitude: '',
  longitude: '',
  radiusMeters: '100',
  qrCode: '',
  evidenceDescription: '',
  manualInstructions: '',
  startsAt: '',
  expiresAt: '',
  maxParticipants: '',
  targetColleges: [],
}

export function QuestForm({ open, onOpenChange, onSuccess }: QuestFormProps) {
  const [formData, setFormData] = useState<QuestFormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const { toast } = useToast()

  const updateField = <K extends keyof QuestFormData>(
    field: K,
    value: QuestFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleCollege = (college: CollegeEnum) => {
    setFormData((prev) => ({
      ...prev,
      targetColleges: prev.targetColleges.includes(college)
        ? prev.targetColleges.filter((c) => c !== college)
        : [...prev.targetColleges, college],
    }))
  }

  const generateQR = () => {
    const code = generateQrCode()
    updateField('qrCode', code)
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      // Build requirements object based on verification type
      let requirements: any = { type: formData.verificationType }
      
      switch (formData.verificationType) {
        case 'gps':
          requirements = {
            type: 'gps',
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            radiusMeters: parseInt(formData.radiusMeters),
          }
          break
        case 'qr_code':
          requirements = {
            type: 'qr_code',
            code: formData.qrCode,
          }
          break
        case 'evidence_upload':
          requirements = {
            type: 'evidence_upload',
            description: formData.evidenceDescription,
          }
          break
        case 'manual':
          requirements = {
            type: 'manual',
            instructions: formData.manualInstructions,
          }
          break
      }

      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          shortDescription: formData.shortDescription,
          difficulty: formData.difficulty,
          xpReward: formData.xpReward,
          goldReward: formData.goldReward,
          requirements,
          startsAt: formData.startsAt || new Date().toISOString(),
          expiresAt: formData.expiresAt,
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
          targetColleges: formData.targetColleges.length > 0 ? formData.targetColleges : null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create quest')
      }

      toast({
        title: 'Quest Created! ⚔️',
        description: `"${formData.title}" is now available for players.`,
      })

      // Reset form and close
      setFormData(initialFormData)
      setStep(1)
      onOpenChange(false)
      onSuccess?.()
    } catch (err) {
      toast({
        title: 'Failed to Create Quest',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData(initialFormData)
    setStep(1)
    onOpenChange(false)
  }

  const isStep1Valid = formData.title && formData.shortDescription && formData.description
  const isStep2Valid = () => {
    switch (formData.verificationType) {
      case 'gps':
        return formData.latitude && formData.longitude && formData.radiusMeters
      case 'qr_code':
        return formData.qrCode
      case 'evidence_upload':
        return formData.evidenceDescription
      case 'manual':
        return formData.manualInstructions
      default:
        return true
    }
  }
  const isStep3Valid = formData.expiresAt

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <Scroll className="h-5 w-5 text-neon-orange" />
            Create New Quest
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Step {step} of 3 - {step === 1 ? 'Basic Info' : step === 2 ? 'Verification' : 'Schedule & Limits'}
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-neon-green' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="title">Quest Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Campus Clean-Up Drive"
                className="mt-1 bg-white/5 border-white/10"
              />
            </div>

            <div>
              <Label htmlFor="shortDesc">Short Description *</Label>
              <Input
                id="shortDesc"
                value={formData.shortDescription}
                onChange={(e) => updateField('shortDescription', e.target.value)}
                placeholder="Brief summary shown on quest cards"
                className="mt-1 bg-white/5 border-white/10"
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="description">Full Description *</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Detailed quest description..."
                className="mt-1 w-full h-24 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-green/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(v) => updateField('difficulty', v as QuestDifficulty)}
                >
                  <SelectTrigger className="mt-1 bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-white/10">
                    {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span style={{ color: config.color }}>{config.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="xp">XP Reward</Label>
                  <Input
                    id="xp"
                    type="number"
                    value={formData.xpReward}
                    onChange={(e) => updateField('xpReward', parseInt(e.target.value) || 0)}
                    className="mt-1 bg-white/5 border-white/10"
                  />
                </div>
                <div>
                  <Label htmlFor="gold">Gold</Label>
                  <Input
                    id="gold"
                    type="number"
                    value={formData.goldReward}
                    onChange={(e) => updateField('goldReward', parseInt(e.target.value) || 0)}
                    className="mt-1 bg-white/5 border-white/10"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <Label>Verification Method</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { type: 'gps', icon: MapPin, label: 'GPS Location', color: 'neon-blue' },
                  { type: 'qr_code', icon: QrCode, label: 'QR Code', color: 'neon-purple' },
                  { type: 'evidence_upload', icon: Camera, label: 'Evidence Upload', color: 'neon-orange' },
                  { type: 'manual', icon: Sparkles, label: 'Manual Review', color: 'neon-green' },
                ].map(({ type, icon: Icon, label, color }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField('verificationType', type as VerificationType)}
                    className={`p-4 rounded-lg border transition-all text-left ${
                      formData.verificationType === type
                        ? `border-${color} bg-${color}/10`
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-2 text-${color}`} />
                    <div className="font-medium text-sm">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            {formData.verificationType === 'gps' && (
              <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-neon-blue">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">GPS Settings</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="lat">Latitude *</Label>
                    <Input
                      id="lat"
                      value={formData.latitude}
                      onChange={(e) => updateField('latitude', e.target.value)}
                      placeholder="e.g., 16.7056"
                      className="mt-1 bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lng">Longitude *</Label>
                    <Input
                      id="lng"
                      value={formData.longitude}
                      onChange={(e) => updateField('longitude', e.target.value)}
                      placeholder="e.g., 121.6453"
                      className="mt-1 bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="radius">Radius (meters) *</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={formData.radiusMeters}
                    onChange={(e) => updateField('radiusMeters', e.target.value)}
                    className="mt-1 bg-white/5 border-white/10"
                  />
                </div>
              </div>
            )}

            {formData.verificationType === 'qr_code' && (
              <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-neon-purple">
                  <QrCode className="h-4 w-4" />
                  <span className="font-medium">QR Code Settings</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={formData.qrCode}
                    onChange={(e) => updateField('qrCode', e.target.value.toUpperCase())}
                    placeholder="Enter or generate code"
                    className="bg-white/5 border-white/10 font-mono"
                  />
                  <Button type="button" onClick={generateQR} variant="outline">
                    Generate
                  </Button>
                </div>
                {formData.qrCode && (
                  <p className="text-xs text-gray-400">
                    Players will need to enter this code: <span className="font-mono text-neon-purple">{formData.qrCode}</span>
                  </p>
                )}
              </div>
            )}

            {formData.verificationType === 'evidence_upload' && (
              <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-neon-orange">
                  <Camera className="h-4 w-4" />
                  <span className="font-medium">Evidence Requirements</span>
                </div>
                <div>
                  <Label htmlFor="evidence">What should players upload? *</Label>
                  <Input
                    id="evidence"
                    value={formData.evidenceDescription}
                    onChange={(e) => updateField('evidenceDescription', e.target.value)}
                    placeholder="e.g., Photo of completion certificate"
                    className="mt-1 bg-white/5 border-white/10"
                  />
                </div>
              </div>
            )}

            {formData.verificationType === 'manual' && (
              <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-neon-green">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-medium">Manual Review Instructions</span>
                </div>
                <div>
                  <Label htmlFor="instructions">Instructions for players *</Label>
                  <textarea
                    id="instructions"
                    value={formData.manualInstructions}
                    onChange={(e) => updateField('manualInstructions', e.target.value)}
                    placeholder="e.g., Register at the OSA office and submit your form"
                    className="mt-1 w-full h-20 px-3 py-2 rounded-md bg-white/5 border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-neon-green/50"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="starts">Starts At</Label>
                <Input
                  id="starts"
                  type="datetime-local"
                  value={formData.startsAt}
                  onChange={(e) => updateField('startsAt', e.target.value)}
                  className="mt-1 bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label htmlFor="expires">Expires At *</Label>
                <Input
                  id="expires"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => updateField('expiresAt', e.target.value)}
                  className="mt-1 bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="maxParticipants">Max Participants (optional)</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={formData.maxParticipants}
                onChange={(e) => updateField('maxParticipants', e.target.value)}
                placeholder="Leave empty for unlimited"
                className="mt-1 bg-white/5 border-white/10"
              />
            </div>

            <div>
              <Label>Target Guilds (optional)</Label>
              <p className="text-xs text-gray-400 mb-2">
                Leave empty to make available to all guilds
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(GUILDS).map(([key, guild]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className={`cursor-pointer transition-all ${
                      formData.targetColleges.includes(key as CollegeEnum)
                        ? 'border-neon-green bg-neon-green/10 text-neon-green'
                        : 'border-white/20 hover:border-white/40'
                    }`}
                    onClick={() => toggleCollege(key as CollegeEnum)}
                  >
                    {guild.icon} {key}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <h4 className="font-medium mb-2 text-gray-400">Quest Preview</h4>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-500">Title:</span> {formData.title || '-'}</p>
                <p><span className="text-gray-500">Difficulty:</span> <span style={{ color: DIFFICULTY_CONFIG[formData.difficulty].color }}>{DIFFICULTY_CONFIG[formData.difficulty].label}</span></p>
                <p><span className="text-gray-500">Rewards:</span> <span className="text-neon-purple">+{formData.xpReward} XP</span> • <span className="text-neon-orange">+{formData.goldReward} Gold</span></p>
                <p><span className="text-gray-500">Verification:</span> {formData.verificationType.replace('_', ' ')}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-white/10">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="border-white/20"
            >
              Previous
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="text-gray-400"
            >
              Cancel
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={step === 1 ? !isStep1Valid : !isStep2Valid()}
              className="bg-neon-green text-black hover:bg-neon-green/80"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || !isStep3Valid}
              className="bg-neon-green text-black hover:bg-neon-green/80"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Quest'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


