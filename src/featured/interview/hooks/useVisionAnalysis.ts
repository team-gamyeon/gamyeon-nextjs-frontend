import { useEffect, useRef, useState } from 'react'
import { useGazeTracker } from '@/featured/interview/hooks/useGazeTracker'
import Webcam from 'react-webcam'
import { FocusState, type Phase } from '@/featured/interview/types'
import {
  calculateEAR,
  extractEulerAngles,
  calculateFocus,
} from '@/featured/interview/utils/visionUtils'
import { renderFaceMesh } from '@/featured/interview/utils/renderFaceMesh'
import { useBlinkDetector } from '@/featured/interview/hooks/useBlinkDetector'
import { useBatchSender } from '@/featured/interview/hooks/useBatchSender'
import { LEFT_EYE, RIGHT_EYE } from '@/featured/interview/constants'

interface UseVisionParams {
  cameraOn: boolean
  phase: Phase
  basePose?: { pitch: number; yaw: number } | null
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
}

export function useVisionAnalysis({ cameraOn, phase, basePose, canvasRef }: UseVisionParams) {
  const { landmarker } = useGazeTracker()
  const { blinkCountRef, updateBlink } = useBlinkDetector()
  const { rawDataRef, eventsRef, lastBatchTimeRef, handleSendBatch } = useBatchSender()

  const webcamRef = useRef<Webcam>(null)
  const requestRef = useRef<number | null>(null)

  const lastSampleTimeRef = useRef(0)
  const lastLoggedStateRef = useRef<FocusState>('CENTER')

  const [realtimeStats, setRealtimeStats] = useState({
    pitch: 0,
    yaw: 0,
    roll: 0,
    ear: 0,
    blinkCount: 0,
    focusState: 'CENTER' as FocusState,
    gaze: { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } },
  })

  const [uiLogs, setUiLogs] = useState<any[]>([])

  useEffect(() => {
    const updateUiLogs = (
      currentFocus: FocusState,
      type: 'AWAY_START' | 'AWAY_END',
      pitch: number,
      yaw: number,
      roll: number,
      gaze: { left: { x: number; y: number }; right: { x: number; y: number } },
    ) => {
      setUiLogs((prev) => {
        const newLog = {
          timestamp: new Date().toLocaleTimeString([], {
            hour12: false,
            minute: '2-digit',
            second: '2-digit',
          }),
          focusState: currentFocus,
          blinkCount: blinkCountRef.current,
          pitch: pitch.toFixed(1),
          yaw: yaw.toFixed(1),
          roll: roll.toFixed(1),
          gaze: {
            left: { x: gaze.left.x, y: gaze.left.y },
            right: { x: gaze.right.x, y: gaze.right.y },
          },
          eventType: type === 'AWAY_END' ? 'RECOVERY' : 'ANOMALY',
        }
        return [newLog, ...prev].slice(0, 5) // 최신 5개 유지
      })
    }

    const detectGaze = () => {
      requestRef.current = requestAnimationFrame(detectGaze)

      const now = performance.now()

      const video = webcamRef.current?.video
      if (!landmarker || !video || video.readyState !== 4) return

      try {
        const result = landmarker.detectForVideo(video, now)
        if (!result.faceLandmarks?.length) return
        const landmarks = result.faceLandmarks[0]

        const scaleX = video.videoWidth
        const scaleY = video.videoHeight

        // 눈 깜빡임
        const rawEAR =
          (calculateEAR(landmarks, LEFT_EYE, scaleX, scaleY) +
            calculateEAR(landmarks, RIGHT_EYE, scaleX, scaleY)) /
          2
        const { blinkCount: currentBlinkNumber, avgEAR } = updateBlink(rawEAR, now)

        // 고개 각도 &  머리 방향
        let pitch = 0,
          yaw = 0,
          roll = 0
        const matrixes = result.facialTransformationMatrixes
        if (matrixes && matrixes.length > 0) {
          const rawMatrix = matrixes[0].data || matrixes[0]
          const angles = extractEulerAngles(rawMatrix)
          pitch = angles.pitch
          yaw = angles.yaw
          roll = angles.roll
        }
        const currentFocus = calculateFocus(pitch, yaw, basePose)

        // Face Mesh
        const canvas = canvasRef?.current
        renderFaceMesh({ canvas, video, landmarks })

        // Gaze (x, y)
        const leftIris = landmarks[468]
        const rightIris = landmarks[473]
        const leftGazeX = leftIris ? Number((1 - leftIris.x).toFixed(3)) : 0
        const leftGazeY = leftIris ? Number(leftIris.y.toFixed(3)) : 0
        const rightGazeX = rightIris ? Number((1 - rightIris.x).toFixed(3)) : 0
        const rightGazeY = rightIris ? Number(rightIris.y.toFixed(3)) : 0

        // raw_data 쌓기
        if (now - lastSampleTimeRef.current >= 100) {
          rawDataRef.current.push({
            offset_ms: Math.floor(now),
            gaze: { left: { x: leftGazeX, y: leftGazeY }, right: { x: rightGazeX, y: rightGazeY } },
            head: { pitch, yaw, roll },
          })
          lastSampleTimeRef.current = now

          setRealtimeStats({
            pitch: Math.round(pitch),
            yaw: Math.round(yaw),
            roll: Math.round(roll),
            ear: Number(avgEAR.toFixed(3)),
            blinkCount: currentBlinkNumber,
            focusState: currentFocus,
            gaze: { left: { x: leftGazeX, y: leftGazeY }, right: { x: rightGazeX, y: rightGazeY } },
          })
          if (rawDataRef.current.length % 20 === 0)
            console.log(`데이터 쌓이는 중... ${rawDataRef.current.length}%`)
        }

        // events 쌓기
        const isStateChanged = currentFocus !== lastLoggedStateRef.current
        if (isStateChanged) {
          const type = currentFocus === 'CENTER' ? 'AWAY_END' : 'AWAY_START'
          const gaze = {
            left: { x: leftGazeX, y: leftGazeY },
            right: { x: rightGazeX, y: rightGazeY },
          }
          eventsRef.current.push({
            type,
            offset_ms: Math.floor(now),
            direction: currentFocus !== 'CENTER' ? currentFocus : 'CENTER',
          })

          updateUiLogs(currentFocus, type, pitch, yaw, roll, gaze)
          lastLoggedStateRef.current = currentFocus
          console.warn(`상태 변경: ${lastLoggedStateRef.current} -> ${currentFocus}`)
        }

        // 10초마다 배치 전송
        if (now - lastBatchTimeRef.current >= 10000) {
          handleSendBatch(blinkCountRef.current)
        }
      } catch (error) {
        console.error('MediaPipe Error:', error)
      }
    }

    if (landmarker && cameraOn && phase === 'answering') {
      lastBatchTimeRef.current = performance.now()
      requestRef.current = requestAnimationFrame(detectGaze)
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
        requestRef.current = null
      }

      if (phase === 'answering' && rawDataRef.current.length > 0) {
        handleSendBatch(blinkCountRef.current)
      }
    }
  }, [landmarker, cameraOn, phase, basePose, handleSendBatch, lastBatchTimeRef])

  return {
    uiLogs,
    realtimeStats,
    webcamRef,
    landmarker,
  }
}
