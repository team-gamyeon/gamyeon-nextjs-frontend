import { FocusState, RawGazeData } from '@/featured/interview/types'
import { PITCH_THRESHOLD, YAW_THRESHOLD } from '@/featured/interview/constants'

const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

/**
 * 눈 깜빡임(EAR) 계산
 */
const calculateEAR = (landmarks: any[], indices: number[], scaleX: number, scaleY: number) => {
  const pts = indices.map((i) => ({
    x: landmarks[i].x * scaleX,
    y: landmarks[i].y * scaleY,
  }))
  const v1 = getDistance(pts[1], pts[5])
  const v2 = getDistance(pts[2], pts[4])
  const h = getDistance(pts[0], pts[3])
  if (h === 0) return 1
  return (v1 + v2) / (2.0 * h)
}

/**
 * 고개 방향 및 집중 상태 판정
 */
const calculateFocus = (pitch: number, yaw: number, basePose: any) => {
  const baseYaw = basePose?.yaw ?? 0
  const basePitch = basePose?.pitch ?? 0
  const deltaYaw = yaw - baseYaw
  const deltaPitch = pitch - basePitch

  const normYaw = deltaYaw / YAW_THRESHOLD
  const normPitch = deltaPitch / PITCH_THRESHOLD
  const magnitude = Math.sqrt(normYaw * normYaw + normPitch * normPitch)

  let currentFocus: FocusState = 'CENTER'
  if (magnitude >= 1) {
    const angle = Math.atan2(-normPitch, -normYaw) * (180 / Math.PI)

    if (angle > -20 && angle <= 20) currentFocus = 'RIGHT'
    else if (angle > 20 && angle <= 65)
      currentFocus = 'TOP-RIGHT' // 45°
    else if (angle > 65 && angle <= 115)
      currentFocus = 'TOP' // 50°
    else if (angle > 115 && angle <= 160)
      currentFocus = 'TOP-LEFT' // 45°
    else if (angle > 160 || angle <= -160) currentFocus = 'LEFT'
    else if (angle > -160 && angle <= -100)
      currentFocus = 'BOTTOM-LEFT' // 60°
    else if (angle > -100 && angle <= -80)
      currentFocus = 'BOTTOM' // 20°
    else currentFocus = 'BOTTOM-RIGHT' // -80° ~ -20° (60°)
  }
  return currentFocus
}

/**
 * Matrix에서 오일러 각도 추출
 */
const extractEulerAngles = (matrix: number[] | Float32Array) => {
  try {
    const RAD_TO_DEG = 180 / Math.PI

    const pitch = Math.atan2(matrix[6], matrix[10]) * RAD_TO_DEG
    const yaw = -Math.asin(matrix[2]) * RAD_TO_DEG
    const roll = -Math.atan2(matrix[1], matrix[0]) * RAD_TO_DEG

    return {
      pitch: Number.isNaN(pitch) ? 0 : pitch,
      yaw: Number.isNaN(yaw) ? 0 : yaw,
      roll: Number.isNaN(roll) ? 0 : roll,
    }
  } catch (e) {
    return { pitch: 0, yaw: 0, roll: 0 }
  }
}

/**
 * 가중 평균 집중도 계산 (0.0 ~ 1.0)
 * 수식: Sum(각 프레임 점수 * 신뢰도) / 총 프레임 수
 */
const calculateAverageConcentration = (rawData: RawGazeData[]): number => {
  if (rawData.length === 0) return 0

  const totalScore = rawData.reduce((acc, frame) => {
    // 임계값(Threshold)을 기준으로 정면 여부 판단
    const isFocusing =
      Math.abs(frame.head.pitch) < PITCH_THRESHOLD && Math.abs(frame.head.yaw) < YAW_THRESHOLD

    const frameScore = isFocusing ? 1 : 0
    return acc + frameScore * frame.confidence
  }, 0)

  const average = totalScore / rawData.length
  return Number(average.toFixed(3))
}

export {
  getDistance,
  calculateEAR,
  calculateFocus,
  extractEulerAngles,
  calculateAverageConcentration,
}
