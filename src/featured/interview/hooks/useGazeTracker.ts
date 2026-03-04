import { useEffect, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { installMediapipeConsoleFilter } from '@/shared/lib/mediapipeConsoleFilter'

export const useGazeTracker = () => {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null)
  const [error, setError] = useState<Error | null>(null) // 에러 상태 추가

  useEffect(() => {
    installMediapipeConsoleFilter()

    // 클린업에서 참조하기 위해 변수로 선언
    let instance: FaceLandmarker | null = null

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
        outputFacialTransformationMatrixes: true,
      })
      setLandmarker(instance)
    }

    initIdx()

    // 3. 컴포넌트 언마운트 시 메모리 해제 (매우 중요)
    return () => {
      if (instance) {
        instance.close() //사용자가 면접 화면이나 카메라 뷰를 벗어났을 때, MediaPipe 인스턴스를 즉각적으로 종료하여 메모리를 반환
      }
    }
  }, [])

  return { landmarker, error }
}
