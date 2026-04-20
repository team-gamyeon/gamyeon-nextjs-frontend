import { useEffect, useState } from 'react'
import { FaceDetector, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

// 전역 변수로 선언 -> 컴포넌트가 나타나든 사라지든 메모리에 딱 한 번만 유지
let globalLandmarker: FaceLandmarker | null = null
let globalDetector: FaceDetector | null = null
let initPromise: Promise<void> | null = null

export const useGazeTracker = () => {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(globalLandmarker)
  const [detector, setDetector] = useState<FaceDetector | null>(globalDetector)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (globalLandmarker && globalDetector) {
      return
    }

    if (!initPromise) {
      initPromise = (async () => {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
        )

        const [lm, fd] = await Promise.all([
          FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: '/models/face_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numFaces: 1,
            outputFacialTransformationMatrixes: true,
          }),
          FaceDetector.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: '/models/face_detector.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
          }),
        ])

        globalLandmarker = lm
        globalDetector = fd
      })()
    }

    // 지역변수로 선언 -> useEffect 가 실행될 때마다 새로 생김
    let cancelled = false

    initPromise
      .then(() => {
        if (!cancelled && globalLandmarker && globalDetector) {
          setLandmarker(globalLandmarker)
          setDetector(globalDetector)
        }
      })
      .catch((err) => {
        initPromise = null
        console.error('두 모델 초기화 실패:', err)

        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { landmarker, detector, error }
}
