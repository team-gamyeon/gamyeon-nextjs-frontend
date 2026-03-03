import { useEffect, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { installMediapipeConsoleFilter } from '@/shared/lib/mediapipeConsoleFilter'

export const useGazeTracker = () => {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null)

  useEffect(() => {
    installMediapipeConsoleFilter()

    const initIdx = async () => {
      // 1. WASM 파일 로더 설정
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
      )

      // 2. Face Landmarker 초기화
      const instance = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: '/models/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFacialTransformationMatrixes: true, // pitch/yaw 계산에 필수
      })
      setLandmarker(instance)
    }
    initIdx()
  }, [])

  return landmarker
}
