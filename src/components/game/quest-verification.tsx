'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, QrCode, Camera, Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGeolocation } from '@/hooks/use-geolocation'
import { calculateDistance } from '@/lib/utils'
import type { QuestRequirement, GpsRequirement, QrCodeRequirement } from '@/types'

interface QuestVerificationProps {
  requirement: QuestRequirement
  onVerified: (proofUrl?: string) => void
  onFailed: (reason: string) => void
}

export function QuestVerification({
  requirement,
  onVerified,
  onFailed,
}: QuestVerificationProps) {
  const [verifying, setVerifying] = useState(false)
  const [qrInput, setQrInput] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const geolocation = useGeolocation()

  const handleGpsVerification = async () => {
    setVerifying(true)
    const gpsReq = requirement as GpsRequirement

    if (geolocation.error) {
      onFailed('Unable to access your location. Please enable GPS.')
      setVerifying(false)
      return
    }

    if (geolocation.latitude && geolocation.longitude) {
      const distance = calculateDistance(
        geolocation.latitude,
        geolocation.longitude,
        gpsReq.latitude,
        gpsReq.longitude
      )

      if (distance <= gpsReq.radiusMeters) {
        onVerified()
      } else {
        onFailed(`You are ${Math.round(distance)}m away. Get within ${gpsReq.radiusMeters}m to verify.`)
      }
    }
    setVerifying(false)
  }

  const handleQrVerification = () => {
    setVerifying(true)
    const qrReq = requirement as QrCodeRequirement

    if (qrInput.trim().toUpperCase() === qrReq.code.toUpperCase()) {
      onVerified()
    } else {
      onFailed('Invalid QR code. Please scan the correct code.')
    }
    setVerifying(false)
  }

  const handleEvidenceUpload = async () => {
    if (!file) {
      onFailed('Please select a file to upload.')
      return
    }

    setVerifying(true)
    const proofUrl = URL.createObjectURL(file)
    onVerified(proofUrl)
    setVerifying(false)
  }

  const renderVerificationUI = () => {
    switch (requirement.type) {
      case 'gps':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span>Location Verification Required</span>
            </div>

            {geolocation.loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Getting your location...</span>
              </div>
            ) : geolocation.error ? (
              <div className="flex items-center gap-2 text-destructive">
                <XCircle className="h-4 w-4" />
                <span>{geolocation.error}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <span>Location acquired (±{Math.round(geolocation.accuracy || 0)}m)</span>
              </div>
            )}

            <Button
              onClick={handleGpsVerification}
              disabled={verifying || geolocation.loading || !!geolocation.error}
              className="w-full"
              variant="quest"
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Location...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Verify My Location
                </>
              )}
            </Button>
          </div>
        )

      case 'qr_code':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <QrCode className="h-5 w-5" />
              <span>QR Code Verification Required</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-code">Enter QR Code</Label>
              <Input
                id="qr-code"
                placeholder="Enter the code from the QR..."
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
              />
            </div>

            <Button
              onClick={handleQrVerification}
              disabled={verifying || !qrInput.trim()}
              className="w-full"
              variant="quest"
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <QrCode className="mr-2 h-4 w-4" />
                  Verify Code
                </>
              )}
            </Button>
          </div>
        )

      case 'evidence_upload':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Camera className="h-5 w-5" />
              <span>Photo Evidence Required</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence">Upload Proof</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="evidence"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
              </div>
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <Button
              onClick={handleEvidenceUpload}
              disabled={verifying || !file}
              className="w-full"
              variant="quest"
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit Evidence
                </>
              )}
            </Button>
          </div>
        )

      default:
        return (
          <div className="text-center text-muted-foreground">
            Manual verification required. A Quest Giver will review your submission.
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border bg-card p-6"
    >
      <h3 className="mb-4 text-lg font-bold">Complete Quest</h3>
      {renderVerificationUI()}
    </motion.div>
  )
}




