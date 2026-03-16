import { useEffect, useRef, useState } from 'react'
import { useGazeTracker } from '@/featured/interview/hooks/useGazeTracker'
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
  videoRef: React.RefObject<HTMLVideoElement | null>
  intvId: number | null
  questionSetId: number | null
}

export function useVisionAnalysis({
  cameraOn,
  phase,
  basePose,
  canvasRef,
  videoRef,
  intvId,
  questionSetId,
}: UseVisionParams) {
  const { landmarker, detector } = useGazeTracker()
  const { blinkCountRef, updateBlink } = useBlinkDetector()
  const { rawDataRef, eventsRef, lastBatchTimeRef, handleSendBatch } = useBatchSender({
    intvId,
    questionSetId,
  })

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

  useEffect(() => {
    const detectGaze = () => {
      requestRef.current = requestAnimationFrame(detectGaze)

      const now = performance.now()

      const video = videoRef.current
      if (!landmarker || !detector || !video || video.readyState !== 4) return

      try {
        // face detector 로 신뢰도 먼저 추출
        const detectorResult = detector.detectForVideo(video, now)
        let nativeConfidence = 0

        if (detectorResult.detections && detectorResult.detections.length > 0) {
          nativeConfidence = detectorResult.detections[0].categories[0].score
        }

        // face landmarker 로 상세 분석
        const result = landmarker.detectForVideo(video, now)
        const landmarks = result.faceLandmarks?.[0] || null

        let pitch = 0,
          yaw = 0,
          roll = 0,
          rawEAR = 0,
          currentFocus: FocusState = 'CENTER'
        let leftGazeX = 0,
          leftGazeY = 0,
          rightGazeX = 0,
          rightGazeY = 0
        let avgEAR = 0,
          currentBlinkNumber = blinkCountRef.current

        if (landmarks) {
          // Face Mesh 렌더링
          const canvas = canvasRef?.current
          renderFaceMesh({ canvas, video, landmarks })

          // 눈 깜빡임
          const scaleX = video.videoWidth
          const scaleY = video.videoHeight
          rawEAR =
            (calculateEAR(landmarks, LEFT_EYE, scaleX, scaleY) +
              calculateEAR(landmarks, RIGHT_EYE, scaleX, scaleY)) /
            2
          const blinkData = updateBlink(rawEAR, now)
          currentBlinkNumber = blinkData.blinkCount
          avgEAR = blinkData.avgEAR

          // 고개 각도 &  머리 방향
          const matrixes = result.facialTransformationMatrixes
          if (matrixes && matrixes.length > 0) {
            const rawMatrix = matrixes[0].data || matrixes[0]
            const angles = extractEulerAngles(rawMatrix)
            pitch = Number(angles.pitch.toFixed(3))
            yaw = Number(angles.yaw.toFixed(3))
            roll = Number(angles.roll.toFixed(3))
          }
          currentFocus = calculateFocus(pitch, yaw, basePose)

          // 시선 좌표
          const leftIris = landmarks[468]
          const rightIris = landmarks[473]
          leftGazeX = leftIris ? Number((1 - leftIris.x).toFixed(3)) : 0
          leftGazeY = leftIris ? Number(leftIris.y.toFixed(3)) : 0
          rightGazeX = rightIris ? Number((1 - rightIris.x).toFixed(3)) : 0
          rightGazeY = rightIris ? Number(rightIris.y.toFixed(3)) : 0
        }

        // raw_data 쌓기
        if (now - lastSampleTimeRef.current >= 100) {
          rawDataRef.current.push({
            offset_ms: Math.floor(now),
            confidence: Number(nativeConfidence.toFixed(2)),
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
        if (landmarks) {
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

            lastLoggedStateRef.current = currentFocus
            console.warn(`상태 변경: ${lastLoggedStateRef.current} -> ${currentFocus}`)
          }
        }

        // 10초마다 배치 전송
        if (now - lastBatchTimeRef.current >= 10000) {
          handleSendBatch(blinkCountRef.current)
        }
      } catch (error) {
        console.error('MediaPipe Error:', error)
      }
    }

    if (landmarker && detector && cameraOn && phase === 'answering') {
      lastBatchTimeRef.current = performance.now()
      requestRef.current = requestAnimationFrame(detectGaze)
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
        requestRef.current = null
      }

      // 10초 안됨 but, 다음질문 넘어가서 배치 전송 필수
      if (phase === 'answering' && rawDataRef.current.length > 0) {
        handleSendBatch(blinkCountRef.current)
      }
    }
  }, [landmarker, detector, cameraOn, phase, basePose, handleSendBatch, videoRef])

  return {
    realtimeStats,
    landmarker,
  }
}
