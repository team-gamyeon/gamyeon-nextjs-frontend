import { useEffect, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export const useGazeTracker = () => {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null)

  useEffect(() => {
    const initIdx = async () => {
      // 1. WASM 파일 로더 설정
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
      )

      // 2. Face Landmarker 초기화
      const instance = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: '/models/face_landmarker.task', // public 폴더 경로
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        // @ts-ignore
        outputIrisLandmarks: true,
      })

      setLandmarker(instance)
    }

    initIdx()
  }, [])

  return landmarker
}
