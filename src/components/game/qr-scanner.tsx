'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Camera, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface QrScannerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (code: string) => void
  expectedCode?: string
}

type ScanState = 'ready' | 'scanning' | 'success' | 'error'

export function QrScanner({ open, onOpenChange, onScan, expectedCode }: QrScannerProps) {
  const [scanState, setScanState] = useState<ScanState>('ready')
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState('')
  const [useManualEntry, setUseManualEntry] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      setScanState('scanning')
      setError('')

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch (err) {
      console.error('Camera error:', err)
      setError('Unable to access camera. Please use manual entry.')
      setUseManualEntry(true)
      setScanState('ready')
    }
  }, [])

  // Clean up on close
  useEffect(() => {
    if (!open) {
      stopCamera()
      setScanState('ready')
      setManualCode('')
      setError('')
      setUseManualEntry(false)
    }
  }, [open, stopCamera])

  // Start camera when opening scanner
  useEffect(() => {
    if (open && !useManualEntry) {
      startCamera()
    }
  }, [open, useManualEntry, startCamera])

  // Simple QR code detection simulation
  // In production, you'd use a library like @zxing/browser or jsQR
  const handleSimulatedScan = () => {
    // For demo purposes, we'll use the manual entry
    // In production, implement actual QR scanning
    setUseManualEntry(true)
  }

  const handleManualSubmit = () => {
    const code = manualCode.trim().toUpperCase()
    
    if (!code) {
      setError('Please enter a code')
      return
    }

    if (expectedCode && code !== expectedCode.toUpperCase()) {
      setError('Invalid code. Please try again.')
      setScanState('error')
      setTimeout(() => {
        setScanState('ready')
        setError('')
      }, 2000)
      return
    }

    setScanState('success')
    setTimeout(() => {
      onScan(code)
      onOpenChange(false)
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-gray-900 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-neon-purple" />
            QR Code Scanner
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Scan the QR code at the event location or enter the code manually
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {scanState === 'success' ? (
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
              <h3 className="mt-4 text-xl font-bold text-neon-green">Code Verified!</h3>
            </motion.div>
          ) : scanState === 'error' ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="py-12 text-center"
            >
              <AlertCircle className="mx-auto h-16 w-16 text-red-500" />
              <h3 className="mt-4 text-xl font-bold text-red-400">Invalid Code</h3>
              <p className="text-gray-400">{error}</p>
            </motion.div>
          ) : useManualEntry ? (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-neon-purple/20">
                    <QrCode className="h-5 w-5 text-neon-purple" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Manual Entry</h3>
                    <p className="text-sm text-gray-400">
                      Enter the code shown on the QR code
                    </p>
                  </div>
                </div>
              </div>

              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Enter code (e.g., QB-ABC123)"
                className="bg-white/5 border-white/10 font-mono text-lg text-center uppercase"
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
              />

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 border-white/20"
                  onClick={() => setUseManualEntry(false)}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Use Camera
                </Button>
                <Button
                  className="flex-1 bg-neon-purple text-white hover:bg-neon-purple/80"
                  onClick={handleManualSubmit}
                  disabled={!manualCode}
                >
                  Verify Code
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Camera View */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2/3 h-2/3 border-2 border-neon-purple rounded-lg relative">
                      <motion.div
                        className="absolute left-0 right-0 h-0.5 bg-neon-purple"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                      {/* Corner markers */}
                      <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-neon-green rounded-tl" />
                      <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-neon-green rounded-tr" />
                      <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-neon-green rounded-bl" />
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-neon-green rounded-br" />
                    </div>
                  </div>
                </div>

                {scanState === 'scanning' && (
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="px-3 py-1 rounded-full bg-black/50 text-sm text-neon-purple">
                      Point at QR code...
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <Button
                variant="outline"
                className="w-full border-white/20"
                onClick={() => setUseManualEntry(true)}
              >
                <QrCode className="mr-2 h-4 w-4" />
                Enter Code Manually
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}


