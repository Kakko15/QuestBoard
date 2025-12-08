'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Download, X, Smartphone, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePWA } from '@/hooks/use-pwa'

function InstallPromptInner() {
  const { isInstallable, isInstalled, isOnline, install, requestNotificationPermission } = usePWA()
  const [dismissed, setDismissed] = useState(true)
  const [showOfflineToast, setShowOfflineToast] = useState(false)

  useEffect(() => {
    const isDismissed = localStorage.getItem('questboard_install_dismissed')
    setDismissed(!!isDismissed)
  }, [])

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineToast(true)
      const timer = setTimeout(() => setShowOfflineToast(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [isOnline])

  const handleInstall = async () => {
    const success = await install()
    if (success) {
      setTimeout(async () => {
        await requestNotificationPermission()
      }, 2000)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('questboard_install_dismissed', 'true')
  }

  // Offline Toast
  if (showOfflineToast) {
    return (
      <div className="fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-in slide-in-from-bottom">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 backdrop-blur-xl">
          <WifiOff className="h-5 w-5 text-yellow-500 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-yellow-400">You're offline</p>
            <p className="text-sm text-muted-foreground">Some features may be limited</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't show install prompt if already installed, dismissed, or not installable
  if (isInstalled || dismissed || !isInstallable) {
    return null
  }

  return (
    <div className="fixed bottom-24 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom">
      <div className="relative p-4 rounded-xl bg-gradient-to-r from-neon-purple/20 to-neon-green/20 border border-white/10 backdrop-blur-xl shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-neon-purple to-neon-green">
            <Smartphone className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">Install QuestBoard</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get the full experience! Access quests offline and receive notifications.
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleInstall}
                className="bg-neon-green text-black hover:bg-neon-green/80 font-bold text-sm"
                size="sm"
              >
                <Download className="h-4 w-4 mr-1" />
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground text-sm"
                size="sm"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Use dynamic import with ssr: false to prevent hydration issues
export const InstallPrompt = dynamic(() => Promise.resolve(InstallPromptInner), {
  ssr: false,
})
