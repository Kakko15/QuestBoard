'use client'

import Image from 'next/image'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="relative text-center">
        <div className="mx-auto mb-6 relative flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-neon-purple to-neon-green shadow-2xl shadow-neon-purple/30 overflow-hidden animate-pulse">
          <Image 
            src="/logo-symbol-only.png" 
            alt="QuestBoard Logo" 
            fill
            sizes="96px"
            className="object-cover p-3"
            priority
          />
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground">
          Quest<span className="text-neon-green">Board</span>
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          ISU-Echague Campus
        </p>

        <div className="mt-8">
          <div className="mx-auto h-1 w-48 overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-1/3 bg-gradient-to-r from-neon-purple to-neon-green animate-loading-bar" />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Loading your adventure...</p>
        </div>
      </div>
    </div>
  )
}
