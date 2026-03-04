import { useEffect, useRef, useState } from 'react'
import { DrawingUtils, FaceLandmarker } from '@mediapipe/tasks-vision'
import { useGazeTracker } from '@/featured/interview/hooks/useGazeTracker'
import Webcam from 'react-webcam'
import {
  InterviewBatchPayload,
  BackendPayload,
  FocusState,
  type Phase,
} from '@/featured/interview/types'
import {
  calculateEAR,
  extractEulerAngles,
  LEFT_EYE,
  RIGHT_EYE,
  EAR_THRESHOLD,
  BLINK_MIN_FRAMES,
  BLINK_MAX_MS,
  EAR_HISTORY_SIZE,
  YAW_THRESHOLD,
  PITCH_THRESHOLD,
  calculateFocus,
} from '@/featured/interview/utils/visionUtils'

interface UseVisionParams {
  cameraOn: boolean
  phase: Phase
  basePose?: { pitch: number; yaw: number } | null
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
}

export function useVisionAnalysis({ cameraOn, phase, basePose, canvasRef }: UseVisionParams) {
  const { landmarker } = useGazeTracker()
  const webcamRef = useRef<Webcam>(null)
  const requestRef = useRef<number | null>(null)

  const rawDataRef = useRef<InterviewBatchPayload['raw_data']>([])
  const eventsRef = useRef<InterviewBatchPayload['events']>([])
  const segmentSequenceRef = useRef(1)

  const lastSampleTimeRef = useRef(0)
  const lastBatchTimeRef = useRef(0)
  const lastLoggedStateRef = useRef<FocusState>('CENTER')

  const [realtimeStats, setRealtimeStats] = useState({
    pitch: 0,
    yaw: 0,
    roll: 0,
    ear: 0,
    blinkCount: 0,
    focusState: 'CENTER' as FocusState,
    leftGazeX: 0,
    leftGazeY: 0,
    rightGazeX: 0,
    rightGazeY: 0,
  })
  const [uiLogs, setUiLogs] = useState<any[]>([])

  const [backendLogs, setBackendLogs] = useState<InterviewBatchPayload>()

  const blinkCountRef = useRef(0)
  const earHistoryRef = useRef<number[]>([]) // EAR 롤링 평균 버퍼
  const eyeClosedFramesRef = useRef(0) // threshold 아래 유지된 연속 프레임 수
  const eyeClosedAtRef = useRef<number | null>(null) // 눈 감긴 시점 (ms)
  const eyeCurrentlyClosedRef = useRef(false) // 현재 눈 감김 상태

  useEffect(() => {
    const updateUiLogs = (
      currentFocus: FocusState,
      type: 'AWAY_START' | 'AWAY_END',
      pitch: number,
      yaw: number,
    ) => {
      setUiLogs((prev) => {
        const newLog = {
          timestamp: new Date().toLocaleTimeString([], {
            hour12: false,
            minute: '2-digit',
            second: '2-digit',
          }),
          focusState: currentFocus,
          blinkCount: blinkCountRef.current,
          pitch: pitch.toFixed(1),
          yaw: yaw.toFixed(1),
          eventType: type === 'AWAY_END' ? 'RECOVERY' : 'ANOMALY',
        }
        return [newLog, ...prev].slice(0, 5) // 최신 5개 유지
      })
    }

    // 서버 전송 : 추후 명세 나오면 utils로 분리 예정
    const sendBatchData = () => {
      if (rawDataRef.current.length === 0) return
      const payload: InterviewBatchPayload = {
        meta: {
          interviewId: 'int_99', //실제 ID 필요
          questionId: 'q_05', //실제 ID 필요
          timestamp: Date.now(),
          segmentSequence: segmentSequenceRef.current,
        },
        metrics_summary: {
          average_concentration: 0, // 로직에 따라 계산
          blink_count: blinkCountRef.current,
          is_away_detected: eventsRef.current.some((e) => e.type === 'AWAY_START'),
        },
        raw_data: [...rawDataRef.current],
        events: [...eventsRef.current],
      }

      // 배치 데이터 콘솔 출력
      console.group(`[BATCH #${segmentSequenceRef.current}] - 10초치 데이터 전송`)
      console.log('최종 페이로드:', payload)
      console.log('수집된 Raw 데이터 수:', rawDataRef.current.length)
      console.log('발생한 이벤트 수:', eventsRef.current.length)
      console.groupEnd()
      console.log('[BATCH SEND]', payload)

      rawDataRef.current = []
      eventsRef.current = []
      segmentSequenceRef.current += 1
      lastBatchTimeRef.current = performance.now()
    }

    const detectGaze = () => {
      requestRef.current = requestAnimationFrame(detectGaze)

      const now = performance.now()

      const video = webcamRef.current?.video
      if (!landmarker || !video || video.readyState !== 4) return

      try {
        const result = landmarker.detectForVideo(video, now)
        if (!result.faceLandmarks?.length) return
        const landmarks = result.faceLandmarks[0]

        // 눈 깜빡임
        const scaleX = video.videoWidth
        const scaleY = video.videoHeight
        const rawEAR =
          (calculateEAR(landmarks, LEFT_EYE, scaleX, scaleY) +
            calculateEAR(landmarks, RIGHT_EYE, scaleX, scaleY)) /
          2

        // EAR 롤링 평균으로 노이즈 제거
        earHistoryRef.current.push(rawEAR)
        if (earHistoryRef.current.length > EAR_HISTORY_SIZE) earHistoryRef.current.shift()
        const avgEAR =
          earHistoryRef.current.reduce((a, b) => a + b, 0) / earHistoryRef.current.length

        // 상태 머신: rawEAR 기준으로 감지 (avgEAR는 UI 표시용)
        if (rawEAR < EAR_THRESHOLD) {
          if (!eyeCurrentlyClosedRef.current) {
            // FALLING edge: 눈이 방금 감김
            eyeCurrentlyClosedRef.current = true
            eyeClosedAtRef.current = now
            eyeClosedFramesRef.current = 1
          } else {
            eyeClosedFramesRef.current += 1
          }
        } else {
          if (eyeCurrentlyClosedRef.current) {
            // RISING edge: 눈이 방금 뜸 → 여기서 깜빡임 유효성 판단
            const duration = eyeClosedAtRef.current !== null ? now - eyeClosedAtRef.current : 0
            if (eyeClosedFramesRef.current >= BLINK_MIN_FRAMES && duration <= BLINK_MAX_MS) {
              blinkCountRef.current += 1
            }
            eyeCurrentlyClosedRef.current = false
            eyeClosedAtRef.current = null
            eyeClosedFramesRef.current = 0
          }
        }

        // 고개 각도
        let pitch = 0,
          yaw = 0,
          roll = 0
        const matrixes = result.facialTransformationMatrixes
        if (matrixes && matrixes.length > 0) {
          const rawMatrix = matrixes[0].data || matrixes[0]
          const angles = extractEulerAngles(rawMatrix)
          pitch = angles.pitch
          yaw = angles.yaw
          roll = angles.roll
        }

        // 머리 방향
        const currentFocus = calculateFocus(pitch, yaw, basePose)

        // 4. Face Mesh 드로잉 — Grid Renderer 스타일 (MediaPipe Studio 동일)
        const canvas = canvasRef?.current
        if (canvas) {
          const cw = canvas.clientWidth
          const ch = canvas.clientHeight
          canvas.width = cw
          canvas.height = ch
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.clearRect(0, 0, cw, ch)

            // object-cover 크롭 보정: 비디오가 컨테이너를 채울 때 잘리는 오프셋 계산
            const vw = video.videoWidth
            const vh = video.videoHeight
            const containerAspect = cw / ch
            const videoAspect = vw / vh
            let scale: number, offsetX: number, offsetY: number
            if (containerAspect > videoAspect) {
              // 컨테이너가 더 넓음 → 너비 기준 스케일, 상하 크롭
              scale = cw / vw
              offsetX = 0
              offsetY = (ch - vh * scale) / 2
            } else {
              // 컨테이너가 더 좁음 → 높이 기준 스케일, 좌우 크롭
              scale = ch / vh
              offsetX = (cw - vw * scale) / 2
              offsetY = 0
            }

            // setTransform: 정규화 좌표 → object-cover 보정 + 미러 반전 한번에 적용
            // x_out = -(vw*scale/cw)*x_in + vw*scale + offsetX
            // y_out = (vh*scale/ch)*y_in + offsetY
            ctx.save()
            ctx.setTransform(
              -(vw * scale) / cw, // a: x 스케일 (음수 = 미러)
              0,
              0,
              (vh * scale) / ch, // d: y 스케일
              vw * scale + offsetX, // e: x 이동
              offsetY, // f: y 이동
            )
            const drawingUtils = new DrawingUtils(ctx)
            // DrawingUtils가 normalized(0~1) 좌표를 canvas.width/height로 스케일하는 것을 이용
            // → canvas.width=cw, canvas.height=ch 이므로 x_in=lx*cw, y_in=ly*ch
            // → setTransform이 이를 실제 화면 위치로 변환
            const lm = result.faceLandmarks[0]
            // 1) 얼굴 전체 메시 — 반투명 실버
            drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
              color: '#C0C0C055',
              lineWidth: 0.5,
            })
            // 2) 얼굴 외곽선
            drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
              color: '#E0E0E0',
              lineWidth: 1.5,
            })
            // 3) 오른쪽 눈 + 눈썹 (빨간)
            drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
              color: '#FF3030',
              lineWidth: 1.5,
            })
            drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, {
              color: '#FF3030',
              lineWidth: 1.5,
            })
            // 4) 왼쪽 눈 + 눈썹 (초록)
            drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
              color: '#30FF30',
              lineWidth: 1.5,
            })
            drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, {
              color: '#30FF30',
              lineWidth: 1.5,
            })
            // 5) 입술
            drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_LIPS, {
              color: '#E0E0E0',
              lineWidth: 1.5,
            })
            // 6) 홍채
            drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, {
              color: '#FF3030',
              lineWidth: 1,
            })
            drawingUtils.drawConnectors(lm, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, {
              color: '#30FF30',
              lineWidth: 1,
            })
            ctx.restore()
          }
        }
        // 5. Gaze (x, y) — 각 iris 중심 (정규화 좌표 0~1, 미러 반전)
        // left iris center: 468, right iris center: 473
        const leftIris = landmarks[468]
        const rightIris = landmarks[473]
        const leftGazeX = leftIris ? Number((1 - leftIris.x).toFixed(3)) : 0
        const leftGazeY = leftIris ? Number(leftIris.y.toFixed(3)) : 0
        const rightGazeX = rightIris ? Number((1 - rightIris.x).toFixed(3)) : 0
        const rightGazeY = rightIris ? Number(rightIris.y.toFixed(3)) : 0

        // raw_data 쌓기
        if (now - lastSampleTimeRef.current >= 100) {
          rawDataRef.current.push({
            offset_ms: Math.floor(now),
            gaze: { left: { x: 33, y: 44 }, right: { x: 55, y: 66 } },
            head: { pitch, yaw, roll },
          })
          lastSampleTimeRef.current = now

          setRealtimeStats({
            pitch: Math.round(pitch),
            yaw: Math.round(yaw),
            roll: Math.round(roll),
            ear: Number(avgEAR.toFixed(3)),
            blinkCount: blinkCountRef.current,
            focusState: currentFocus,
            leftGazeX: 0,
            leftGazeY: 0,
            rightGazeX: 0,
            rightGazeY: 0,
          })
          if (rawDataRef.current.length % 20 === 0)
            console.log(`데이터 쌓이는 중... ${rawDataRef.current.length}%`)
        }

        // events 쌓기
        const isStateChanged = currentFocus !== lastLoggedStateRef.current
        if (isStateChanged) {
          const type = currentFocus === 'CENTER' ? 'AWAY_END' : 'AWAY_START'
          eventsRef.current.push({
            type,
            offset_ms: Math.floor(now),
            direction: currentFocus !== 'CENTER' ? currentFocus : 'CENTER',
          })

          updateUiLogs(currentFocus, type, pitch, yaw)
          lastLoggedStateRef.current = currentFocus
          console.warn(`상태 변경: ${lastLoggedStateRef.current} -> ${currentFocus}`)
        }

        // 10초마다 배치 전송
        if (now - lastBatchTimeRef.current >= 10000) {
          sendBatchData()
        }
      } catch (error) {
        console.error('MediaPipe Error:', error)
      }
    }

    if (landmarker && cameraOn && phase === 'answering') {
      lastBatchTimeRef.current = performance.now()
      requestRef.current = requestAnimationFrame(detectGaze)
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [landmarker, cameraOn, phase, basePose])

  return {
    uiLogs,
    realtimeStats,
    webcamRef,
    landmarker,
  }
}
