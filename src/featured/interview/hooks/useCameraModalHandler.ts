import { useState, useRef, useEffect } from 'react'
import { FaceLandmarker } from '@mediapipe/tasks-vision'
import { useGazeTracker } from '@/featured/interview/hooks/useGazeTracker'
import { type PermStatus } from '@/featured/interview/types'
import { validateFacePosition } from '@/featured/interview/utils/setupUtils'
import { ALIGN_DURATION_MS } from '@/featured/interview/constants'

interface UseCameraModalHandlerReturn {
  landmarker: FaceLandmarker | null
  cameraStatus: PermStatus
  setCameraStatus: React.Dispatch<React.SetStateAction<PermStatus>>
  cameraVideoRef: React.RefObject<HTMLVideoElement | null>
  basePose: { pitch: number; yaw: number } | null
  alignProgress: number
  faceDetected: boolean
  requestCamera: () => Promise<void>
  confirmCamera: () => void
  cameraStream: MediaStream | null
}

export function useCameraModalHandler(): UseCameraModalHandlerReturn {
  const { landmarker } = useGazeTracker()

  const [cameraStatus, setCameraStatus] = useState<PermStatus>('idle')
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [basePose, setBasePose] = useState<{ pitch: number; yaw: number } | null>(null)
  const [alignProgress, setAlignProgress] = useState(0)
  const [faceDetected, setFaceDetected] = useState(false)

  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const poseDetectRef = useRef<number | null>(null)

  // 카메라 스트림 → 비디오 엘리먼트 연결
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

        const { inPosition, pitch, yaw } = validateFacePosition(result, matrixes)
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
      } catch {}
      poseDetectRef.current = requestAnimationFrame(detect)
    }

    poseDetectRef.current = requestAnimationFrame(detect)
    return () => {
      if (poseDetectRef.current) cancelAnimationFrame(poseDetectRef.current)
    }
  }, [cameraStatus, landmarker, basePose])

  // 언마운트 시 리소스 정리 (스트림은 면접 세션을 위해 유지)
  useEffect(() => {
    return () => {
      if (poseDetectRef.current) {
        cancelAnimationFrame(poseDetectRef.current)
        poseDetectRef.current = null
      }
      // 스트림은 다음 단계에서 사용햐야 하므로 여기서 stop() X => useInterview.ts 에서 정리
    }
  }, [])

  // 카메라 권한 요청 및 웹캠 스트림 시작
  const requestCamera = async () => {
    setBasePose(null)
    setAlignProgress(0)
    setFaceDetected(false)
    setCameraStatus('requesting')
    try {
      // 1. 하드웨어 장치 목록 한 번 훑어서 브라우저의 권한 캐시 강제로 최신화
      await navigator.mediaDevices.enumerateDevices()
      // 2. 그 다음 스트림 요청
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      cameraStreamRef.current = stream
      setCameraStream(stream)
      setCameraStatus('granted')
    } catch {
      setCameraStatus('denied')
    }
  }

  // 카메라 설정 확인 후 스트림 정리 (basePose 유지)
  const confirmCamera = () => {
    if (poseDetectRef.current) {
      cancelAnimationFrame(poseDetectRef.current)
      poseDetectRef.current = null
    }
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
    cameraStream,
  }
}
