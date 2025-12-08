'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'

function CursorInner() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const cursorOuterRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const targetRef = useRef({ x: 0, y: 0 })
  const [isTouchDevice, setIsTouchDevice] = useState(true)

  const updateCursor = useCallback(() => {
    positionRef.current.x += (targetRef.current.x - positionRef.current.x) * 0.15
    positionRef.current.y += (targetRef.current.y - positionRef.current.y) * 0.15

    if (cursorRef.current) {
      cursorRef.current.style.transform = `translate(${targetRef.current.x - 8}px, ${targetRef.current.y - 8}px)`
    }
    if (cursorOuterRef.current) {
      cursorOuterRef.current.style.transform = `translate(${positionRef.current.x - 16}px, ${positionRef.current.y - 16}px)`
    }

    rafRef.current = requestAnimationFrame(updateCursor)
  }, [])

  useEffect(() => {
    // Check for touch device
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(isTouch)
    
    if (isTouch) return

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isPointer = window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a')

      if (cursorRef.current) {
        cursorRef.current.style.transform = isPointer
          ? `translate(${targetRef.current.x - 8}px, ${targetRef.current.y - 8}px) scale(1.5)`
          : `translate(${targetRef.current.x - 8}px, ${targetRef.current.y - 8}px) scale(1)`
      }
      if (cursorOuterRef.current) {
        cursorOuterRef.current.style.opacity = isPointer ? '0.5' : '0.2'
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseover', handleMouseOver, { passive: true })
    rafRef.current = requestAnimationFrame(updateCursor)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseover', handleMouseOver)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [updateCursor])

  if (isTouchDevice) return null

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-4 h-4 bg-neon-green rounded-full pointer-events-none z-[9999] will-change-transform hidden md:block"
        style={{ transition: 'transform 0.05s linear' }}
      />
      <div
        ref={cursorOuterRef}
        className="fixed top-0 left-0 w-8 h-8 border border-neon-green rounded-full pointer-events-none z-[9999] opacity-20 will-change-transform hidden md:block"
      />
    </>
  )
}

// Use dynamic import with ssr: false to prevent hydration issues
export const CustomCursor = dynamic(() => Promise.resolve(CursorInner), {
  ssr: false,
})
