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
      try {
        // 1. WASM 파일 로더 설정
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm',
        )

        // 2. Face Landmarker 초기화
        instance = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: '/models/face_landmarker.task',
            delegate: 'GPU', //연산을 유저의 그래픽 카드(GPU)로 넘겨 프론트엔드 UI 렌더링 성능을 보장하는 핵심 옵션
          },
          runningMode: 'VIDEO', //스트리밍되는 웹캠 프레임 간의 연속성을 추적하여 처리 속도와 정확도를 높입니다.
          numFaces: 1, //면접자 본인 1명의 얼굴만 트래킹하도록 제한하여 불필요한 연산 낭비를 막습니다.
          outputFacialTransformationMatrixes: true, // pitch/yaw 계산에 필수 (시선/고개 이탈 판정을 위한 핵심 설정)
        })

        setLandmarker(instance)
      } catch (err) {
        console.error('FaceLandmarker 초기화 실패:', err)
        setError(err instanceof Error ? err : new Error(String(err)))
      }
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
