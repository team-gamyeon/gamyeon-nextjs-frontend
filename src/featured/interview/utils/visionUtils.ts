const getDistance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y)
}

// scaleX/scaleY로 정규화 좌표 → 픽셀 변환 후 EAR 계산
// (가로/세로 스케일이 다른 영상에서 aspect ratio 왜곡 방지)
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

const LEFT_EYE = [33, 160, 158, 133, 153, 144]
const RIGHT_EYE = [362, 385, 387, 263, 373, 380]

// EAR 임계값 및 깜빡임 감지 상수
const EAR_THRESHOLD = 0.22
const BLINK_MIN_FRAMES = 2 // EAR이 threshold 아래로 유지돼야 할 최소 연속 프레임 (50ms × 2 = 100ms)
const BLINK_MAX_MS = 400 // 이 시간 초과 시 깜빡임 아닌 눈 감음으로 판단
const EAR_HISTORY_SIZE = 3 // EAR 롤링 평균 윈도우 크기

// 시선 방향 판단 임계값 (정규화 기준)
const YAW_THRESHOLD = 15 // 좌우 이탈 기준 (°)
const PITCH_THRESHOLD = 12 // 상하 이탈 기준 (°)

export {
  getDistance,
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
}
