import { useEffect, useState } from 'react'
import { FaceDetector, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

export const useGazeTracker = () => {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(null)
  const [detector, setDetector] = useState<FaceDetector | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // 지역변수 선언: 클린업에서 참조하기 위해
    let landmarkerInstance: FaceLandmarker | null = null
    let detectorInstance: FaceDetector | null = null

    const initModels = async () => {
      try {
        // 1. WASM 파일 로더 설정
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
        )

        // 2. 두 모델 병렬로 초기화
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
        landmarkerInstance = lm
        detectorInstance = fd

        setLandmarker(landmarkerInstance)
        setDetector(detectorInstance)
      } catch (err) {
        console.error('두 모델 초기화 실패:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
      }
    }

    initModels()

    // 3. 컴포넌트 언마운트 시 메모리 해제: 사용자가 면접 화면이나 카메라 뷰를 벗어났을 때, MediaPipe 인스턴스를 즉각적으로 종료하여 메모리를 반환
    return () => {
      if (landmarkerInstance) {
        landmarkerInstance.close()
      }
      if (detectorInstance) {
        detectorInstance.close()
      }
    }
  }, [])

  return { landmarker, detector, error }
}
