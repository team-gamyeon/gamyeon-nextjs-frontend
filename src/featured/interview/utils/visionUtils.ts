import { FocusState } from '@/featured/interview/types'
import { PITCH_THRESHOLD, YAW_THRESHOLD } from '@/featured/interview/constants'

const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

// scaleX/scaleY로 정규화 좌표 → 픽셀 변환 후 EAR 계산 (가로/세로 스케일이 다른 영상에서 aspect ratio 왜곡 방지)
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

// 머리 방향 (basePose 기준, 정규화 벡터 + atan2 각도 기반 9방향)
const calculateFocus = (pitch: any, yaw: any, basePose: any) => {
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

// Matrix 파싱 안정성 강화
const extractEulerAngles = (matrix: number[] | Float32Array) => {
  try {
    const RAD_TO_DEG = 180 / Math.PI
    // MediaPipe 4x4 column-major 변환 행렬 → ZYX Euler 각도 추출
    const pitch = Math.atan2(matrix[6], matrix[10]) * RAD_TO_DEG // 상하 (X축)
    const yaw = -Math.asin(matrix[2]) * RAD_TO_DEG // 좌우 (Y축), 미러 보정
    const roll = -Math.atan2(matrix[1], matrix[0]) * RAD_TO_DEG // 기울기 (Z축), 미러 보정

    return {
      pitch: isNaN(pitch) ? 0 : pitch,
      yaw: isNaN(yaw) ? 0 : yaw,
      roll: isNaN(roll) ? 0 : roll,
    }
  } catch (e) {
    return { pitch: 0, yaw: 0, roll: 0 }
  }
}

const calculateAverageConcentration = (rawData: any[]) => {
  if (rawData.length === 0) return 0

  const focusedCount = rawData.filter((d) => {
    return Math.abs(d.head.pitch) < PITCH_THRESHOLD && Math.abs(d.head.yaw) < YAW_THRESHOLD
  }).length

  const score = (focusedCount / rawData.length) * 100
  return Math.round(score)
}

export {
  getDistance,
  calculateEAR,
  calculateFocus,
  extractEulerAngles,
  calculateAverageConcentration,
}
