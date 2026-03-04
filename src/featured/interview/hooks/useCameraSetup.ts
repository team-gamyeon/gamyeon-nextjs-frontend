import { useState, useRef, useEffect } from 'react'
import { FaceLandmarker } from '@mediapipe/tasks-vision'
import { useGazeTracker } from '@/featured/interview/hooks/useGazeTracker'
import { type PermStatus } from '@/featured/interview/types'
import {
  ALIGN_THRESHOLD,
  ALIGN_DURATION_MS,
  extractSetupEulerAngles,
} from '@/featured/interview/utils/setupUtils'

interface UseCameraSetupReturn {
  landmarker: FaceLandmarker | null
  cameraStatus: PermStatus
  setCameraStatus: React.Dispatch<React.SetStateAction<PermStatus>>
  cameraVideoRef: React.RefObject<HTMLVideoElement | null>
  basePose: { pitch: number; yaw: number } | null
  alignProgress: number
  faceDetected: boolean
  requestCamera: () => Promise<void>
  confirmCamera: () => void
}

export function useCameraSetup(): UseCameraSetupReturn {
  const { landmarker } = useGazeTracker()

  const [cameraStatus, setCameraStatus] = useState<PermStatus>('idle')
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [basePose, setBasePose] = useState<{ pitch: number; yaw: number } | null>(null)
  const [alignProgress, setAlignProgress] = useState(0)
  const [faceDetected, setFaceDetected] = useState(false)

  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const poseDetectRef = useRef<number | null>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)

  // 카메라 스트림 → video 엘리먼트 연결
  useEffect(() => {
    if (cameraStatus === 'granted' && cameraVideoRef.current && cameraStream) {
      cameraVideoRef.current.srcObject = cameraStream
    }
  }, [cameraStatus, cameraStream])

  // base pose 캡처 루프
  useEffect(() => {
    if (cameraStatus !== 'granted' || !landmarker || basePose) return

    const faceLandmarker = landmarker
    const video = cameraVideoRef.current
    if (!video) return

    let alignStart: number | null = null

    const detect = () => {
      if (video.readyState !== 4) {
        poseDetectRef.current = requestAnimationFrame(detect)
        return
      }
      try {
        const now = performance.now()
        const result = faceLandmarker.detectForVideo(video, now)

        if (!result.faceLandmarks?.length) {
          alignStart = null
          setAlignProgress(0)
          setFaceDetected(false)
          poseDetectRef.current = requestAnimationFrame(detect)
          return
        }

        setFaceDetected(true)

        const matrixes = result.facialTransformationMatrixes
        if (!matrixes?.length) {
          poseDetectRef.current = requestAnimationFrame(detect)
          return
        }

        // 코 중앙 고정 + 얼굴 크기 + 대칭 + 각도 — 4박자 통과 조건
        const landmarks = result.faceLandmarks[0]
        const noseTip = landmarks[1]
        const leftCheek = landmarks[234]
        const rightCheek = landmarks[454]

        const isNoseCentered =
          noseTip.x > 0.45 && noseTip.x < 0.55 && noseTip.y > 0.4 && noseTip.y < 0.6

        const faceWidth = Math.abs(leftCheek.x - rightCheek.x)
        const isProperSize = faceWidth > 0.2 && faceWidth < 0.35

        const leftDist = Math.abs(noseTip.x - leftCheek.x)
        const rightDist = Math.abs(rightCheek.x - noseTip.x)
        const symmetryRatio = rightDist > 0 ? leftDist / rightDist : 0
        const isSymmetric = symmetryRatio > 0.7 && symmetryRatio < 1.3

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawMatrix = (matrixes[0] as any).data ?? matrixes[0]
        const { pitch, yaw } = extractSetupEulerAngles(rawMatrix)
        const isStraight = Math.abs(pitch) < ALIGN_THRESHOLD && Math.abs(yaw) < ALIGN_THRESHOLD

        const inPosition = isNoseCentered && isProperSize && isSymmetric && isStraight

        if (inPosition) {
          if (alignStart === null) alignStart = now
          const elapsed = now - alignStart
          setAlignProgress(Math.min(100, (elapsed / ALIGN_DURATION_MS) * 100))

          if (elapsed >= ALIGN_DURATION_MS) {
            setBasePose({ pitch: Math.round(pitch), yaw: Math.round(yaw) })
            return
          }
        } else {
          alignStart = null
          setAlignProgress(0)
        }
      } catch {
        // ignore
      }
      poseDetectRef.current = requestAnimationFrame(detect)
    }

    poseDetectRef.current = requestAnimationFrame(detect)
    return () => {
      if (poseDetectRef.current) cancelAnimationFrame(poseDetectRef.current)
    }
  }, [cameraStatus, landmarker, basePose])

  // 언마운트 시 스트림 정리
  useEffect(() => {
    return () => {
      if (poseDetectRef.current) cancelAnimationFrame(poseDetectRef.current)
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  // 카메라 권한 요청 및 웹캠 스트림 시작
  const requestCamera = async () => {
    setBasePose(null)
    setAlignProgress(0)
    setFaceDetected(false)
    setCameraStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      cameraStreamRef.current = stream
      setCameraStream(stream)
      setCameraStatus('granted')
    } catch {
      setCameraStatus('denied')
    }
  }

  // 카메라 설정 확인 후 스트림 정리 (basePose는 유지)
  const confirmCamera = () => {
    if (poseDetectRef.current) cancelAnimationFrame(poseDetectRef.current)
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop())
    cameraStreamRef.current = null
    setCameraStream(null)
  }

  return {
    landmarker,
    cameraStatus,
    setCameraStatus,
    cameraVideoRef,
    basePose,
    alignProgress,
    faceDetected,
    requestCamera,
    confirmCamera,
  }
}
