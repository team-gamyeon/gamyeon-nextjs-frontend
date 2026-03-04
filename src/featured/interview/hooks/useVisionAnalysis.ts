import { useEffect, useRef, useState } from 'react'
import { useGazeTracker } from '@/featured/interview/hooks/useGazeTracker'
import Webcam from 'react-webcam'
import { BackendPayload, type Phase } from '@/featured/interview/types'
import {
  calculateEAR,
  extractEulerAngles,
  LEFT_EYE,
  RIGHT_EYE,
  EAR_THRESHOLD,
} from '@/featured/interview/utils/visionUtils'

interface UseVisionParams {
  cameraOn: boolean
  phase: Phase
  basePose?: { pitch: number; yaw: number } | null
}

export function useVisionAnalysis({ cameraOn, phase, basePose }: UseVisionParams) {
  const landmarker = useGazeTracker()
  const webcamRef = useRef<Webcam>(null)
  const requestRef = useRef<number | null>(null)

  const [realtimeStats, setRealtimeStats] = useState({
    pitch: 0,
    yaw: 0,
    ear: 0,
    focusState: 'CENTER',
  })

  const [backendLogs, setBackendLogs] = useState<BackendPayload[]>([])

  const blinkCountRef = useRef(0)
  const isBlinkingRef = useRef(false)
  const lastDetectTimeRef = useRef(0)
  const lastStateUpdateRef = useRef(0)
  const lastLogTimeRef = useRef(0)

  const lastLoggedStateRef = useRef<'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN'>('CENTER')

  const DETECT_INTERVAL_MS = 50
  const STATE_INTERVAL_MS = 100

  useEffect(() => {
    const detectGaze = () => {
      requestRef.current = requestAnimationFrame(detectGaze)

      const now = performance.now()
      if (now - lastDetectTimeRef.current < DETECT_INTERVAL_MS) return
      lastDetectTimeRef.current = now

      const video = webcamRef.current?.video
      if (!landmarker || !video || video.readyState !== 4) return

      try {
        const result = landmarker.detectForVideo(video, now)
        if (!result.faceLandmarks?.length) return

        const landmarks = result.faceLandmarks[0]

        // 1. EAR (눈 깜빡임) — 픽셀 좌표 기준으로 계산
        const scaleX = video.videoWidth
        const scaleY = video.videoHeight
        const avgEAR =
          (calculateEAR(landmarks, LEFT_EYE, scaleX, scaleY) +
            calculateEAR(landmarks, RIGHT_EYE, scaleX, scaleY)) /
          2
        if (avgEAR < EAR_THRESHOLD) {
          if (!isBlinkingRef.current) {
            blinkCountRef.current += 1
            isBlinkingRef.current = true
          }
        } else {
          isBlinkingRef.current = false
        }

        // 2. Head Pose (고개 각도)
        let pitch = 0,
          yaw = 0
        const matrixes = result.facialTransformationMatrixes
        if (matrixes && matrixes.length > 0) {
          // MediaPipe 버전에 따라 data 객체 안에 있거나 배열 자체일 수 있음
          const rawMatrix = matrixes[0].data || matrixes[0]
          const angles = extractEulerAngles(rawMatrix)
          pitch = angles.pitch
          yaw = angles.yaw
        }

        // 3. 시선 집중도 (basePose 기준으로 상대 판단)
        const baseYaw = basePose?.yaw ?? 0
        const basePitch = basePose?.pitch ?? 0
        let currentFocus: 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' = 'CENTER'
        if (yaw - baseYaw > 15) currentFocus = 'LEFT'
        else if (yaw - baseYaw < -15) currentFocus = 'RIGHT'
        else if (pitch - basePitch > 15) currentFocus = 'DOWN'
        else if (pitch - basePitch < -10) currentFocus = 'UP'

        // 4. UI 상태 업데이트
        if (now - lastStateUpdateRef.current >= STATE_INTERVAL_MS) {
          lastStateUpdateRef.current = now
          setRealtimeStats({
            pitch: Math.round(pitch),
            yaw: Math.round(yaw),
            ear: Number(avgEAR.toFixed(2)),
            focusState: currentFocus,
          })
        }

        // 5. 특이점 발생 시에만 백엔드 전송 (Event-driven)
        const isAnomaly = currentFocus !== 'CENTER'
        const isStateChanged = currentFocus !== lastLoggedStateRef.current
        const timeSinceLastLog = now - lastLogTimeRef.current

        // 조건 1: 시선 이탈이 감지되었고 (상태가 막 변했거나, 이탈한 지 2초가 지났을 때)
        if (isAnomaly && (isStateChanged || timeSinceLastLog > 2000)) {
          lastLogTimeRef.current = now
          lastLoggedStateRef.current = currentFocus

          setBackendLogs((prev) =>
            [
              {
                timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
                focusState: currentFocus,
                blinkCount: blinkCountRef.current,
                pitch: pitch.toFixed(1),
                yaw: yaw.toFixed(1),
                eventType: 'ANOMALY' as const,
              },
              ...prev,
            ].slice(0, 5),
          )
          blinkCountRef.current = 0
        }
        // 조건 2: 시선이 이탈했다가 다시 정면('CENTER')으로 복귀했을 때 (1회성 기록)
        else if (!isAnomaly && isStateChanged) {
          lastLogTimeRef.current = now
          lastLoggedStateRef.current = 'CENTER'

          setBackendLogs((prev) =>
            [
              {
                timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
                focusState: 'CENTER' as const,
                blinkCount: blinkCountRef.current,
                pitch: pitch.toFixed(1),
                yaw: yaw.toFixed(1),
                eventType: 'RECOVERY' as const,
              },
              ...prev,
            ].slice(0, 5),
          )
          blinkCountRef.current = 0
        }
      } catch (error) {
        console.error('MediaPipe Error:', error)
      }
    }

    if (landmarker && cameraOn && phase === 'answering') {
      requestRef.current = requestAnimationFrame(detectGaze)
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [landmarker, cameraOn, phase])

  return {
    backendLogs,
    realtimeStats,
    webcamRef,
    landmarker,
  }
}
