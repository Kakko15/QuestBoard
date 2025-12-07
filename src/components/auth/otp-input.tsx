'use client'

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  autoFocus = true,
  className,
}: OTPInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  // Split value into array of characters
  const valueArray = value.split('').concat(Array(length - value.length).fill(''))

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return // Only allow digits

    const newValue = valueArray.slice()
    newValue[index] = digit.slice(-1) // Take only the last digit
    const newValueStr = newValue.join('').slice(0, length)
    onChange(newValueStr)

    // Move to next input if digit entered
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setActiveIndex(index + 1)
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const newValue = valueArray.slice()
      
      if (valueArray[index]) {
        // Clear current cell
        newValue[index] = ''
        onChange(newValue.join(''))
      } else if (index > 0) {
        // Move to previous cell and clear it
        newValue[index - 1] = ''
        onChange(newValue.join(''))
        inputRefs.current[index - 1]?.focus()
        setActiveIndex(index - 1)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setActiveIndex(index - 1)
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
      setActiveIndex(index + 1)
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pastedData)
    
    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, length - 1)
    inputRefs.current[nextIndex]?.focus()
    setActiveIndex(nextIndex)
  }

  const handleFocus = (index: number) => {
    setActiveIndex(index)
    // Select the content when focusing
    inputRefs.current[index]?.select()
  }

  return (
    <div className={cn('flex gap-2 sm:gap-3 justify-center', className)}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={valueArray[index]}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          disabled={disabled}
          className={cn(
            'w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold font-mono',
            'bg-black/40 border-2 rounded-lg outline-none transition-all duration-200',
            'focus:ring-2 focus:ring-neon-green/50',
            activeIndex === index && !disabled
              ? 'border-neon-green text-neon-green shadow-[0_0_15px_rgba(0,255,136,0.3)]'
              : 'border-white/20 text-white',
            valueArray[index] && 'border-neon-purple/50 text-neon-green',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  )
}
