import { useEffect, useState } from 'react'
import { FaceDetector, FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

// 🌟 1. 컴포넌트 '밖'에 전역 변수로 선언합니다. (Singleton 패턴 핵심)
// 이렇게 하면 컴포넌트가 나타나든 사라지든 메모리에 딱 한 번만 유지됩니다.
let globalLandmarker: FaceLandmarker | null = null
let globalDetector: FaceDetector | null = null
let initPromise: Promise<void> | null = null // 중복 실행 방지용 자물쇠(Lock)

export const useGazeTracker = () => {
  const [landmarker, setLandmarker] = useState<FaceLandmarker | null>(globalLandmarker)
  const [detector, setDetector] = useState<FaceDetector | null>(globalDetector)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // 2. 이미 AI 모델이 준비되어 있다면, 다시 다운로드하지 않고 바로 사용!
    if (globalLandmarker && globalDetector) {
      setLandmarker(globalLandmarker)
      setDetector(globalDetector)
      return
    }

    // 3. 누군가 이미 다운로드를 시작했다면, 끝날 때까지 기다리기만 합니다. (4번 중복 요청 방지)
    if (!initPromise) {
      initPromise = (async () => {
        try {
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
        } catch (err) {
          console.error('두 모델 초기화 실패:', err)
          setError(err instanceof Error ? err : new Error(String(err)))
          initPromise = null // 실패하면 다음에 다시 시도할 수 있게 자물쇠 초기화
        }
      })()
    }

    // 다운로드가 완료되면 상태를 업데이트해줍니다.
    initPromise.then(() => {
      if (globalLandmarker && globalDetector) {
        setLandmarker(globalLandmarker)
        setDetector(globalDetector)
      }
    })

    // 4. 클린업 함수(언마운트 시 close) 삭제!
    // 페이지를 완전히 떠나기 전까지는 AI 모델을 파괴하지 않고 재사용합니다.landmarkerInstance.close()
  }, [])

  return { landmarker, detector, error }
}
