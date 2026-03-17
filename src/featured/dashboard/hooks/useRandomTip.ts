import { useState, useEffect } from 'react'
import { INTERVIEW_TIPS } from '@/featured/dashboard/constants'

export function useRandomTip() {
  const [tip, setTip] = useState(INTERVIEW_TIPS[0])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setTip(INTERVIEW_TIPS[Math.floor(Math.random() * INTERVIEW_TIPS.length)])
      setMounted(true)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  return { tip: mounted ? tip : INTERVIEW_TIPS[0] }
}
