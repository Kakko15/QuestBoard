'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store,
  Coins,
  Sparkles,
  Crown,
  Star,
  Palette,
  Frame,
  Zap,
  CheckCircle2,
  Loader2,
  Lock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { useUser } from '@/hooks/use-user'
import { useToast } from '@/hooks/use-toast'
import { formatNumber, cn } from '@/lib/utils'

interface ShopItem {
  id: string
  name: string
  description: string
  price: number
  category: 'avatar' | 'frame' | 'badge' | 'boost'
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  owned?: boolean
}

const SHOP_ITEMS: ShopItem[] = [
  // Avatars
  { id: 'avatar-knight', name: 'Knight Avatar', description: 'A noble knight ready for adventure', price: 500, category: 'avatar', icon: '⚔️', rarity: 'common' },
  { id: 'avatar-mage', name: 'Mage Avatar', description: 'A powerful spellcaster', price: 750, category: 'avatar', icon: '🧙', rarity: 'rare' },
  { id: 'avatar-dragon', name: 'Dragon Rider', description: 'Master of dragons', price: 1500, category: 'avatar', icon: '🐉', rarity: 'epic' },
  { id: 'avatar-phoenix', name: 'Phoenix Lord', description: 'Rise from the ashes', price: 3000, category: 'avatar', icon: '🔥', rarity: 'legendary' },
  
  // Frames
  { id: 'frame-bronze', name: 'Bronze Frame', description: 'A sturdy bronze border', price: 200, category: 'frame', icon: '🥉', rarity: 'common' },
  { id: 'frame-silver', name: 'Silver Frame', description: 'Elegant silver finish', price: 500, category: 'frame', icon: '🥈', rarity: 'rare' },
  { id: 'frame-gold', name: 'Gold Frame', description: 'Prestigious gold border', price: 1000, category: 'frame', icon: '🥇', rarity: 'epic' },
  { id: 'frame-diamond', name: 'Diamond Frame', description: 'Ultimate prestige', price: 2500, category: 'frame', icon: '💎', rarity: 'legendary' },
  
  // Badges
  { id: 'badge-scholar', name: 'Scholar Badge', description: 'Show your dedication to learning', price: 300, category: 'badge', icon: '📚', rarity: 'common' },
  { id: 'badge-hero', name: 'Hero Badge', description: 'Recognized for heroic deeds', price: 600, category: 'badge', icon: '🦸', rarity: 'rare' },
  { id: 'badge-legend', name: 'Legend Badge', description: 'A true legend walks among us', price: 1200, category: 'badge', icon: '👑', rarity: 'epic' },
  { id: 'badge-mythic', name: 'Mythic Badge', description: 'Transcended mortal limits', price: 2000, category: 'badge', icon: '✨', rarity: 'legendary' },
  
  // Boosts
  { id: 'boost-xp-small', name: 'XP Boost (1h)', description: '+25% XP for 1 hour', price: 100, category: 'boost', icon: '⚡', rarity: 'common' },
  { id: 'boost-xp-medium', name: 'XP Boost (4h)', description: '+25% XP for 4 hours', price: 350, category: 'boost', icon: '⚡', rarity: 'rare' },
  { id: 'boost-xp-large', name: 'XP Boost (24h)', description: '+25% XP for 24 hours', price: 800, category: 'boost', icon: '⚡', rarity: 'epic' },
  { id: 'boost-double', name: 'Double XP (1h)', description: '+100% XP for 1 hour', price: 500, category: 'boost', icon: '🚀', rarity: 'legendary' },
]

const RARITY_COLORS = {
  common: '#9ca3af',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
}

export default function ShopPage() {
  const { user, signOut, refreshUser } = useUser()
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  const handlePurchase = async (item: ShopItem) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to make purchases',
        variant: 'destructive',
      })
      return
    }

    if (user.gold < item.price) {
      toast({
        title: 'Insufficient Gold',
        description: `You need ${item.price - user.gold} more gold`,
        variant: 'destructive',
      })
      return
    }

    setPurchasing(item.id)

    try {
      const response = await fetch('/api/shop/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed')
      }

      setOwnedItems((prev) => new Set([...prev, item.id]))
      refreshUser()

      toast({
        title: 'Purchase Successful! 🎉',
        description: `You bought ${item.name} for ${item.price} gold`,
      })
    } catch (err) {
      toast({
        title: 'Purchase Failed',
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setPurchasing(null)
    }
  }

  const renderItem = (item: ShopItem) => {
    const isOwned = ownedItems.has(item.id) || item.owned
    const canAfford = user ? user.gold >= item.price : false
    const isPurchasing = purchasing === item.id

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="relative"
      >
        <Card
          className={cn(
            'bg-black/40 border-white/10 backdrop-blur-xl overflow-hidden transition-all',
            isOwned && 'border-neon-green/30 bg-neon-green/5'
          )}
        >
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{ backgroundColor: RARITY_COLORS[item.rarity] }}
          />
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{item.icon}</div>
              <Badge
                className="text-xs"
                style={{
                  backgroundColor: `${RARITY_COLORS[item.rarity]}20`,
                  color: RARITY_COLORS[item.rarity],
                }}
              >
                {item.rarity}
              </Badge>
            </div>
            <h3 className="font-bold text-white mb-1">{item.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{item.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-neon-orange font-bold">
                <Coins className="h-4 w-4" />
                {formatNumber(item.price)}
              </div>
              {isOwned ? (
                <Badge className="bg-neon-green/20 text-neon-green border-none">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Owned
                </Badge>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handlePurchase(item)}
                  disabled={!canAfford || isPurchasing}
                  className={cn(
                    'font-bold',
                    canAfford
                      ? 'bg-neon-green text-black hover:bg-neon-green/80'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  )}
                >
                  {isPurchasing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : !canAfford ? (
                    <>
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </>
                  ) : (
                    'Buy'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const avatars = SHOP_ITEMS.filter((i) => i.category === 'avatar')
  const frames = SHOP_ITEMS.filter((i) => i.category === 'frame')
  const badges = SHOP_ITEMS.filter((i) => i.category === 'badge')
  const boosts = SHOP_ITEMS.filter((i) => i.category === 'boost')

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar user={user} onSignOut={signOut} />

      <main className="container mx-auto px-4 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold">Gold Shop</h1>
                <p className="text-gray-400">
                  Spend your hard-earned gold on rewards
                </p>
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                <Coins className="h-5 w-5 text-neon-orange" />
                <span className="font-display text-xl font-bold text-neon-orange">
                  {formatNumber(user.gold)}
                </span>
              </div>
            )}
          </div>
        </motion.div>

        <Tabs defaultValue="avatars">
          <TabsList className="mb-6 bg-white/5 border border-white/10">
            <TabsTrigger value="avatars" className="gap-2 data-[state=active]:bg-neon-purple data-[state=active]:text-white">
              <Crown className="h-4 w-4" />
              Avatars
            </TabsTrigger>
            <TabsTrigger value="frames" className="gap-2 data-[state=active]:bg-neon-blue data-[state=active]:text-white">
              <Frame className="h-4 w-4" />
              Frames
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-2 data-[state=active]:bg-neon-green data-[state=active]:text-black">
              <Star className="h-4 w-4" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="boosts" className="gap-2 data-[state=active]:bg-neon-orange data-[state=active]:text-black">
              <Zap className="h-4 w-4" />
              Boosts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="avatars">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {avatars.map(renderItem)}
            </div>
          </TabsContent>

          <TabsContent value="frames">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {frames.map(renderItem)}
            </div>
          </TabsContent>

          <TabsContent value="badges">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {badges.map(renderItem)}
            </div>
          </TabsContent>

          <TabsContent value="boosts">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {boosts.map(renderItem)}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}


