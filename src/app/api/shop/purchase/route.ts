import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Shop items with prices
const SHOP_ITEMS: Record<string, { name: string; price: number; category: string }> = {
  'avatar-knight': { name: 'Knight Avatar', price: 500, category: 'avatar' },
  'avatar-mage': { name: 'Mage Avatar', price: 750, category: 'avatar' },
  'avatar-dragon': { name: 'Dragon Rider', price: 1500, category: 'avatar' },
  'avatar-phoenix': { name: 'Phoenix Lord', price: 3000, category: 'avatar' },
  'frame-bronze': { name: 'Bronze Frame', price: 200, category: 'frame' },
  'frame-silver': { name: 'Silver Frame', price: 500, category: 'frame' },
  'frame-gold': { name: 'Gold Frame', price: 1000, category: 'frame' },
  'frame-diamond': { name: 'Diamond Frame', price: 2500, category: 'frame' },
  'badge-scholar': { name: 'Scholar Badge', price: 300, category: 'badge' },
  'badge-hero': { name: 'Hero Badge', price: 600, category: 'badge' },
  'badge-legend': { name: 'Legend Badge', price: 1200, category: 'badge' },
  'badge-mythic': { name: 'Mythic Badge', price: 2000, category: 'badge' },
  'boost-xp-small': { name: 'XP Boost (1h)', price: 100, category: 'boost' },
  'boost-xp-medium': { name: 'XP Boost (4h)', price: 350, category: 'boost' },
  'boost-xp-large': { name: 'XP Boost (24h)', price: 800, category: 'boost' },
  'boost-double': { name: 'Double XP (1h)', price: 500, category: 'boost' },
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemId } = await request.json()

    const item = SHOP_ITEMS[itemId]
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Get user's current gold
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('gold')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile) {
      throw profileError || new Error('Profile not found')
    }

    if (profile.gold < item.price) {
      return NextResponse.json({ error: 'Insufficient gold' }, { status: 400 })
    }

    // Deduct gold
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ gold: profile.gold - item.price })
      .eq('id', session.user.id)

    if (updateError) {
      throw updateError
    }

    // Log the purchase
    await supabase.from('activity_logs').insert({
      user_id: session.user.id,
      action_type: 'shop_purchase',
      metadata: {
        item_id: itemId,
        item_name: item.name,
        price: item.price,
        category: item.category,
      },
    })

    // Create notification
    await supabase.from('notifications').insert({
      user_id: session.user.id,
      title: 'Purchase Complete! 🛒',
      message: `You purchased ${item.name} for ${item.price} gold.`,
      type: 'system',
    })

    return NextResponse.json({
      success: true,
      item: item.name,
      remainingGold: profile.gold - item.price,
    })
  } catch (error) {
    console.error('Shop purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to complete purchase' },
      { status: 500 }
    )
  }
}


