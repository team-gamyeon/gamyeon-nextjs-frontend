'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface TypingTextProps {
  text: string
  speed?: number
  onComplete?: () => void
  className?: string
}

export function TypingText({ text, speed = 40, onComplete, className = '' }: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  // onComplete를 ref로 보관 → useEffect 의존성에서 제외, 무한 재실행 방지
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)
    let i = 0

    const interval = setInterval(() => {
      i++
      setDisplayedText(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(interval)
        setIsComplete(true)
        onCompleteRef.current?.()
      }
    }, speed)

    return () => clearInterval(interval)
    // text, speed만 의존 → onComplete 변경으로 재실행되지 않음
  }, [text, speed])

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="ml-0.5 inline-block h-4 w-0.5 bg-white/70 align-text-bottom"
        />
      )}
    </span>
  )
}
