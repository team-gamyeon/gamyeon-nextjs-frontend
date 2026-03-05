import { useRef } from 'react'
import {
  BLINK_MAX_MS,
  BLINK_MIN_FRAMES,
  EAR_HISTORY_SIZE,
  EAR_THRESHOLD,
} from '@/featured/interview/constants'

export function useBlinkDetector() {
  const blinkCountRef = useRef(0)
  const eyeClosedFramesRef = useRef(0) // threshold 아래 유지된 연속 프레임 수
  const eyeClosedAtRef = useRef<number | null>(null) // 눈 감긴 시점 (ms)
  const isCurrentlyClosedRef = useRef(false) // 현재 눈 감김 상태

  const earHistoryRef = useRef<number[]>([]) // EAR 롤링 평균 버퍼

  const updateBlink = (rawEAR: number, now: number) => {
    // EAR 롤링 평균으로 노이즈 제거
    earHistoryRef.current.push(rawEAR)
    if (earHistoryRef.current.length > EAR_HISTORY_SIZE) earHistoryRef.current.shift()
    const avgEAR = earHistoryRef.current.reduce((a, b) => a + b, 0) / earHistoryRef.current.length

    if (rawEAR < EAR_THRESHOLD) {
      if (!isCurrentlyClosedRef.current) {
        isCurrentlyClosedRef.current = true
        eyeClosedAtRef.current = now
        eyeClosedFramesRef.current = 1
      } else {
        eyeClosedFramesRef.current += 1
      }
    } else {
      if (isCurrentlyClosedRef.current) {
        // RISING edge: 눈이 방금 뜸 → 여기서 깜빡임 유효성 판단
        const duration = eyeClosedAtRef.current !== null ? now - eyeClosedAtRef.current : 0
        if (eyeClosedFramesRef.current >= BLINK_MIN_FRAMES && duration <= BLINK_MAX_MS) {
          blinkCountRef.current += 1
        }

        isCurrentlyClosedRef.current = false
        eyeClosedAtRef.current = null
        eyeClosedFramesRef.current = 0
      }
    }
    return {
      blinkCount: blinkCountRef.current,
      avgEAR,
    }
  }

  const resetBlinkCount = () => {
    blinkCountRef.current = 0
  }

  return {
    blinkCountRef,
    updateBlink,
    resetBlinkCount,
  }
}
