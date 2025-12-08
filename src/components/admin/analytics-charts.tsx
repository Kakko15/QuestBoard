'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Users, Scroll, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface ChartData {
  label: string
  value: number
  color?: string
}

interface LineChartData {
  date: string
  quests: number
  users: number
}

// Simple Bar Chart Component
function BarChart({ data, maxValue }: { data: ChartData[]; maxValue?: number }) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-1"
        >
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{item.label}</span>
            <span className="font-bold" style={{ color: item.color || '#fff' }}>
              {item.value.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: item.color || '#22c55e' }}
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// Simple Line Chart Component (using SVG)
function LineChart({ data }: { data: LineChartData[] }) {
  if (data.length === 0) return null

  const maxQuests = Math.max(...data.map((d) => d.quests), 1)
  const maxUsers = Math.max(...data.map((d) => d.users), 1)
  const max = Math.max(maxQuests, maxUsers)

  const width = 100
  const height = 50
  const padding = 2

  const getY = (value: number) => {
    return height - padding - ((value / max) * (height - padding * 2))
  }

  const getX = (index: number) => {
    return padding + (index / (data.length - 1)) * (width - padding * 2)
  }

  const questsPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.quests)}`)
    .join(' ')

  const usersPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.users)}`)
    .join(' ')

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((percent) => (
          <line
            key={percent}
            x1={padding}
            y1={height - padding - (percent / 100) * (height - padding * 2)}
            x2={width - padding}
            y2={height - padding - (percent / 100) * (height - padding * 2)}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.3"
          />
        ))}
        
        {/* Quests line */}
        <motion.path
          d={questsPath}
          fill="none"
          stroke="#22c55e"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
        
        {/* Users line */}
        <motion.path
          d={usersPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </svg>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 mt-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-neon-green rounded" />
          <span className="text-gray-400">Quests Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-neon-blue rounded" />
          <span className="text-gray-400">Active Users</span>
        </div>
      </div>
    </div>
  )
}

// Donut Chart Component
function DonutChart({ data }: { data: ChartData[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let currentAngle = 0

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-40 h-40">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100
          const angle = (percentage / 100) * 360
          const startAngle = currentAngle
          const endAngle = currentAngle + angle
          currentAngle = endAngle

          const startRad = (startAngle - 90) * (Math.PI / 180)
          const endRad = (endAngle - 90) * (Math.PI / 180)

          const x1 = 50 + 40 * Math.cos(startRad)
          const y1 = 50 + 40 * Math.sin(startRad)
          const x2 = 50 + 40 * Math.cos(endRad)
          const y2 = 50 + 40 * Math.sin(endRad)

          const largeArc = angle > 180 ? 1 : 0

          return (
            <motion.path
              key={index}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={item.color}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            />
          )
        })}
        {/* Center circle for donut effect */}
        <circle cx="50" cy="50" r="25" fill="#111" />
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{total.toLocaleString()}</div>
          <div className="text-xs text-gray-400">Total</div>
        </div>
      </div>
    </div>
  )
}

interface AnalyticsChartsProps {
  className?: string
}

export function AnalyticsCharts({ className }: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState('7d')
  const [loading, setLoading] = useState(false)

  // Mock data - in production, this would come from an API
  const engagementData: LineChartData[] = [
    { date: 'Mon', quests: 45, users: 120 },
    { date: 'Tue', quests: 52, users: 135 },
    { date: 'Wed', quests: 48, users: 128 },
    { date: 'Thu', quests: 67, users: 156 },
    { date: 'Fri', quests: 73, users: 178 },
    { date: 'Sat', quests: 89, users: 210 },
    { date: 'Sun', quests: 95, users: 245 },
  ]

  const questsByDifficulty: ChartData[] = [
    { label: 'Common', value: 456, color: '#9ca3af' },
    { label: 'Uncommon', value: 234, color: '#22c55e' },
    { label: 'Rare', value: 123, color: '#3b82f6' },
    { label: 'Epic', value: 67, color: '#a855f7' },
    { label: 'Legendary', value: 23, color: '#f59e0b' },
  ]

  const guildActivity: ChartData[] = [
    { label: 'CCSICT', value: 1250, color: '#fda003' },
    { label: 'COE', value: 1180, color: '#4c0204' },
    { label: 'CED', value: 1120, color: '#217580' },
    { label: 'CBAPA', value: 980, color: '#080e88' },
    { label: 'CON', value: 950, color: '#d60685' },
  ]

  const userSegments: ChartData[] = [
    { label: 'Grinders', value: 1245, color: '#22c55e' },
    { label: 'Socializers', value: 892, color: '#3b82f6' },
    { label: 'Achievers', value: 678, color: '#a855f7' },
    { label: 'Explorers', value: 456, color: '#f59e0b' },
    { label: 'At-Risk', value: 149, color: '#ef4444' },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Analytics Overview</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32 bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/10">
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Engagement Trends */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-sm">
              <TrendingUp className="h-4 w-4 text-neon-green" />
              Engagement Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={engagementData} />
          </CardContent>
        </Card>

        {/* User Segments */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-sm">
              <Users className="h-4 w-4 text-neon-blue" />
              User Segments (K-Means)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="flex items-center gap-6">
              <DonutChart data={userSegments} />
              <div className="space-y-2">
                {userSegments.map((segment) => (
                  <div key={segment.label} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-gray-400">{segment.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quests by Difficulty */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-sm">
              <Scroll className="h-4 w-4 text-neon-orange" />
              Quests by Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={questsByDifficulty} />
          </CardContent>
        </Card>

        {/* Guild Activity */}
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-sm">
              <Calendar className="h-4 w-4 text-neon-purple" />
              Top Guild Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={guildActivity} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


