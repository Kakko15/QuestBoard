'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Camera,
  QrCode,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  Upload,
  Navigation,
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
import { useGeolocation } from '@/hooks/use-geolocation'
import { DIFFICULTY_CONFIG } from '@/lib/constants'
import type { Quest } from '@/types'

interface QuestVerificationModalProps {
  quest: Quest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (proofUrl?: string) => void
}

type VerificationStep = 'info' | 'verify' | 'success' | 'error'

export function QuestVerificationModal({
  quest,
  open,
  onOpenChange,
  onComplete,
}: QuestVerificationModalProps) {
  const [step, setStep] = useState<VerificationStep>('info')
  const [verifying, setVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [qrCode, setQrCode] = useState('')
  const { latitude, longitude, error: geoError, loading: geoLoading, getCurrentPosition } = useGeolocation()

  const resetState = useCallback(() => {
    setStep('info')
    setVerifying(false)
    setErrorMessage('')
    setProofFile(null)
    setQrCode('')
  }, [])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetState()
    }
    onOpenChange(open)
  }

  if (!quest) return null

  const difficulty = DIFFICULTY_CONFIG[quest.difficulty]

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  const handleGPSVerification = async () => {
    setVerifying(true)
    setStep('verify')

    try {
      await getCurrentPosition()
      
      if (latitude && longitude && quest.requirements.type === 'gps') {
        const distance = calculateDistance(
          latitude,
          longitude,
          quest.requirements.latitude,
          quest.requirements.longitude
        )

        if (distance <= quest.requirements.radiusMeters) {
          setStep('success')
          setTimeout(() => {
            onComplete()
            handleOpenChange(false)
          }, 1500)
        } else {
          setErrorMessage(`You are ${Math.round(distance)}m away. You need to be within ${quest.requirements.radiusMeters}m.`)
          setStep('error')
        }
      } else if (geoError) {
        setErrorMessage(geoError)
        setStep('error')
      }
    } catch (err) {
      setErrorMessage('Failed to get your location. Please enable location services.')
      setStep('error')
    } finally {
      setVerifying(false)
    }
  }

  const handleQRVerification = () => {
    setVerifying(true)
    setStep('verify')

    setTimeout(() => {
      if (quest.requirements.type === 'qr_code' && qrCode === quest.requirements.code) {
        setStep('success')
        setTimeout(() => {
          onComplete()
          handleOpenChange(false)
        }, 1500)
      } else {
        setErrorMessage('Invalid QR code. Please try again.')
        setStep('error')
      }
      setVerifying(false)
    }, 1000)
  }

  const handleEvidenceUpload = async () => {
    if (!proofFile) {
      setErrorMessage('Please select a file to upload.')
      setStep('error')
      return
    }

    setVerifying(true)
    setStep('verify')

    // In a real app, you would upload the file to storage
    // For now, we'll simulate the upload
    setTimeout(() => {
      setStep('success')
      setTimeout(() => {
        onComplete(`evidence/${proofFile.name}`)
        handleOpenChange(false)
      }, 1500)
      setVerifying(false)
    }, 2000)
  }

  const handleManualSubmit = () => {
    setVerifying(true)
    setStep('verify')

    setTimeout(() => {
      setStep('success')
      setTimeout(() => {
        onComplete()
        handleOpenChange(false)
      }, 1500)
      setVerifying(false)
    }, 1000)
  }

  const renderVerificationContent = () => {
    switch (quest.requirements.type) {
      case 'gps':
        return (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-neon-blue/20">
                  <MapPin className="h-5 w-5 text-neon-blue" />
                </div>
                <div>
                  <h3 className="font-semibold">GPS Verification</h3>
                  <p className="text-sm text-gray-400">
                    You must be within {quest.requirements.radiusMeters}m of the target location
                  </p>
                </div>
              </div>
              {latitude && longitude && (
                <p className="text-xs text-gray-500">
                  Your location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              )}
            </div>
            <Button
              className="w-full bg-neon-blue text-white hover:bg-neon-blue/80 font-bold"
              onClick={handleGPSVerification}
              disabled={verifying || geoLoading}
            >
              {geoLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <Navigation className="mr-2 h-4 w-4" />
                  Verify My Location
                </>
              )}
            </Button>
          </div>
        )

      case 'qr_code':
        return (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-neon-purple/20">
                  <QrCode className="h-5 w-5 text-neon-purple" />
                </div>
                <div>
                  <h3 className="font-semibold">QR Code Verification</h3>
                  <p className="text-sm text-gray-400">
                    Enter the code from the QR at the event location
                  </p>
                </div>
              </div>
            </div>
            <Input
              placeholder="Enter QR code..."
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              className="bg-white/5 border-white/10 text-white"
            />
            <Button
              className="w-full bg-neon-purple text-white hover:bg-neon-purple/80 font-bold"
              onClick={handleQRVerification}
              disabled={verifying || !qrCode}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </div>
        )

      case 'evidence_upload':
        return (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-neon-orange/20">
                  <Camera className="h-5 w-5 text-neon-orange" />
                </div>
                <div>
                  <h3 className="font-semibold">Evidence Upload</h3>
                  <p className="text-sm text-gray-400">
                    {quest.requirements.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-neon-orange/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="hidden"
                id="evidence-upload"
              />
              <label htmlFor="evidence-upload" className="cursor-pointer">
                <Upload className="mx-auto h-10 w-10 text-gray-500 mb-2" />
                <p className="text-sm text-gray-400">
                  {proofFile ? proofFile.name : 'Click to upload evidence'}
                </p>
              </label>
            </div>
            <Button
              className="w-full bg-neon-orange text-black hover:bg-neon-orange/80 font-bold"
              onClick={handleEvidenceUpload}
              disabled={verifying || !proofFile}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Submit Evidence'
              )}
            </Button>
          </div>
        )

      case 'manual':
        return (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-neon-green/20">
                  <Sparkles className="h-5 w-5 text-neon-green" />
                </div>
                <div>
                  <h3 className="font-semibold">Manual Verification</h3>
                  <p className="text-sm text-gray-400">
                    {quest.requirements.instructions}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-400 text-center">
              By clicking below, you confirm that you have completed the quest requirements.
              A Quest Giver may verify your submission.
            </p>
            <Button
              className="w-full bg-neon-green text-black hover:bg-neon-green/80 font-bold"
              onClick={handleManualSubmit}
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for Review'
              )}
            </Button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-gray-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">
            Complete Quest
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {quest.title}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {renderVerificationContent()}
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-12 text-center"
            >
              <Loader2 className="mx-auto h-16 w-16 animate-spin text-neon-green" />
              <p className="mt-4 text-gray-400">Verifying...</p>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                <CheckCircle2 className="mx-auto h-20 w-20 text-neon-green" />
              </motion.div>
              <h3 className="mt-4 text-2xl font-bold font-display text-neon-green">
                Quest Complete!
              </h3>
              <p className="mt-2 text-gray-400">
                +{quest.xpReward} XP • +{quest.goldReward} Gold
              </p>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-8 text-center"
            >
              <XCircle className="mx-auto h-16 w-16 text-red-500" />
              <h3 className="mt-4 text-xl font-bold">Verification Failed</h3>
              <p className="mt-2 text-gray-400">{errorMessage}</p>
              <Button
                className="mt-6"
                variant="outline"
                onClick={() => setStep('info')}
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}


