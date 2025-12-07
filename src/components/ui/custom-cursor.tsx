'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      const target = e.target as HTMLElement
      setIsPointer(window.getComputedStyle(target).cursor === 'pointer')
    }

    window.addEventListener('mousemove', updateMousePosition)
    return () => window.removeEventListener('mousemove', updateMousePosition)
  }, [])

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-neon-green rounded-full pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
        }}
        animate={{
          scale: isPointer ? 1.5 : 1,
        }}
        transition={{ duration: 0.1 }}
      />
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border border-neon-green rounded-full pointer-events-none z-[9999]"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isPointer ? 1.2 : 1,
          opacity: isPointer ? 0.5 : 0.2,
        }}
        transition={{ type: 'spring', stiffness: 800, damping: 35, mass: 0.5 }}
      />
    </>
  )
}

