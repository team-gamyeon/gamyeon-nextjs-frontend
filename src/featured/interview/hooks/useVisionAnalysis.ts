import { useEffect, useRef, useState } from 'react'
import { DrawingUtils, FaceLandmarker } from '@mediapipe/tasks-vision'
import { useGazeTracker } from '@/featured/interview/hooks/useGazeTracker'
import Webcam from 'react-webcam'
import { BackendPayload, FocusState, type Phase } from '@/featured/interview/types'
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
} from '@/featured/interview/utils/visionUtils'

interface UseVisionParams {
  cameraOn: boolean
  phase: Phase
  basePose?: { pitch: number; yaw: number } | null
  canvasRef?: React.RefObject<HTMLCanvasElement | null>
}

export function useVisionAnalysis({ cameraOn, phase, basePose, canvasRef }: UseVisionParams) {
  const landmarker = useGazeTracker()
  const webcamRef = useRef<Webcam>(null)
  const requestRef = useRef<number | null>(null)

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

  const [backendLogs, setBackendLogs] = useState<BackendPayload[]>([])

  const blinkCountRef = useRef(0)
  // 눈 깜빡임 감지 상태 머신
  const earHistoryRef = useRef<number[]>([]) // EAR 롤링 평균 버퍼
  const eyeClosedFramesRef = useRef(0) // threshold 아래 유지된 연속 프레임 수
  const eyeClosedAtRef = useRef<number | null>(null) // 눈 감긴 시점 (ms)
  const eyeCurrentlyClosedRef = useRef(false) // 현재 눈 감김 상태
  const lastDetectTimeRef = useRef(0)
  const lastStateUpdateRef = useRef(0)
  const lastLogTimeRef = useRef(0)
  const lastLoggedStateRef = useRef<FocusState>('CENTER')

  const DETECT_INTERVAL_MS = 50
  const STATE_INTERVAL_MS = 100

  useEffect(() => {
    const detectGaze = () => {
      requestRef.current = requestAnimationFrame(detectGaze)

      const now = performance.now()
      if (now - lastDetectTimeRef.current < DETECT_INTERVAL_MS) return
      lastDetectTimeRef.current = now

      const video = webcamRef.current?.video
      if (!landmarker || !video || video.readyState !== 4) return

      try {
        const result = landmarker.detectForVideo(video, now)
        if (!result.faceLandmarks?.length) return

        const landmarks = result.faceLandmarks[0]

        // 1. EAR (눈 깜빡임) — 픽셀 좌표 기준으로 계산
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

        // 2. Head Pose (고개 각도)
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

        // 3. 시선 집중도 (basePose 기준, 정규화 벡터 + atan2 각도 기반 9방향)
        const baseYaw = basePose?.yaw ?? 0
        const basePitch = basePose?.pitch ?? 0
        const deltaYaw = yaw - baseYaw
        const deltaPitch = pitch - basePitch

        // 각 축의 임계값으로 정규화 → 타원형 영역을 원형으로 변환
        const normYaw = deltaYaw / YAW_THRESHOLD
        const normPitch = deltaPitch / PITCH_THRESHOLD
        const magnitude = Math.sqrt(normYaw * normYaw + normPitch * normPitch)

        let currentFocus: FocusState = 'CENTER'
        if (magnitude >= 1) {
          // angle 기준: 0°=RIGHT, 90°=TOP, ±180°=LEFT, -90°=BOTTOM
          const angle = Math.atan2(-normPitch, -normYaw) * (180 / Math.PI)
          // RIGHT·LEFT: 40° 섹터 (±20°, 타이트)
          // TOP 대각선: 45° 섹터, BOTTOM 대각선: 60° 섹터
          // TOP: 50° 섹터, BOTTOM: 20° 섹터 (타이트)
          if (angle > -20 && angle <= 20) currentFocus = 'RIGHT'
          else if (angle > 20 && angle <= 65) currentFocus = 'TOP-RIGHT'   // 45°
          else if (angle > 65 && angle <= 115) currentFocus = 'TOP'        // 50°
          else if (angle > 115 && angle <= 160) currentFocus = 'TOP-LEFT'  // 45°
          else if (angle > 160 || angle <= -160) currentFocus = 'LEFT'
          else if (angle > -160 && angle <= -100) currentFocus = 'BOTTOM-LEFT'  // 60°
          else if (angle > -100 && angle <= -80) currentFocus = 'BOTTOM'        // 20°
          else currentFocus = 'BOTTOM-RIGHT' // -80° ~ -20° (60°)
        }

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
              -(vw * scale) / cw,   // a: x 스케일 (음수 = 미러)
              0, 0,
              (vh * scale) / ch,    // d: y 스케일
              vw * scale + offsetX, // e: x 이동
              offsetY,              // f: y 이동
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

        // 5. UI 상태 업데이트
        if (now - lastStateUpdateRef.current >= STATE_INTERVAL_MS) {
          lastStateUpdateRef.current = now
          setRealtimeStats({
            pitch: Math.round(pitch),
            yaw: Math.round(yaw),
            roll: Math.round(roll),
            ear: Number(avgEAR.toFixed(3)),
            blinkCount: blinkCountRef.current,
            focusState: currentFocus,
            leftGazeX,
            leftGazeY,
            rightGazeX,
            rightGazeY,
          })
        }

        // 5. 특이점 발생 시에만 백엔드 전송 (Event-driven)
        const isAnomaly = currentFocus !== 'CENTER'
        const isStateChanged = currentFocus !== lastLoggedStateRef.current
        const timeSinceLastLog = now - lastLogTimeRef.current

        // 조건 1: 시선 이탈이 감지되었고 (상태가 막 변했거나, 이탈한 지 2초가 지났을 때)
        if (isAnomaly && (isStateChanged || timeSinceLastLog > 2000)) {
          lastLogTimeRef.current = now
          lastLoggedStateRef.current = currentFocus

          setBackendLogs((prev) =>
            [
              {
                timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
                focusState: currentFocus,
                blinkCount: blinkCountRef.current,
                pitch: pitch.toFixed(1),
                yaw: yaw.toFixed(1),
                roll: roll.toFixed(1),
                leftGazeX: leftGazeX.toFixed(3),
                leftGazeY: leftGazeY.toFixed(3),
                rightGazeX: rightGazeX.toFixed(3),
                rightGazeY: rightGazeY.toFixed(3),
                eventType: 'ANOMALY' as const,
              },
              ...prev,
            ].slice(0, 5),
          )
        }
        // 조건 2: 시선이 이탈했다가 다시 정면('CENTER')으로 복귀했을 때 (1회성 기록)
        else if (!isAnomaly && isStateChanged) {
          lastLogTimeRef.current = now
          lastLoggedStateRef.current = 'CENTER'

          setBackendLogs((prev) =>
            [
              {
                timestamp: new Date().toISOString().split('T')[1].slice(0, 8),
                focusState: 'CENTER' as const,
                blinkCount: blinkCountRef.current,
                pitch: pitch.toFixed(1),
                yaw: yaw.toFixed(1),
                roll: roll.toFixed(1),
                leftGazeX: leftGazeX.toFixed(3),
                leftGazeY: leftGazeY.toFixed(3),
                rightGazeX: rightGazeX.toFixed(3),
                rightGazeY: rightGazeY.toFixed(3),
                eventType: 'RECOVERY' as const,
              },
              ...prev,
            ].slice(0, 5),
          )
        }
      } catch (error) {
        console.error('MediaPipe Error:', error)
      }
    }

    if (landmarker && cameraOn && phase === 'answering') {
      requestRef.current = requestAnimationFrame(detectGaze)
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [landmarker, cameraOn, phase])

  return {
    backendLogs,
    realtimeStats,
    webcamRef,
    landmarker,
  }
}
