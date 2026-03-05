export const ALIGN_THRESHOLD = 8 // 정면 판정 각도 기준 (8도 이내면 정면)
export const ALIGN_DURATION_MS = 3000 // 3초 유지 필요

// NaN 발생 시 999(완전 이탈)로 처리해 절대 통과하지 못하게 막는 setup 전용 버전
export const extractSetupEulerAngles = (matrix: number[] | Float32Array): { pitch: number; yaw: number } => {
  try {
    const RAD_TO_DEG = 180 / Math.PI
    const pitch = Math.atan2(matrix[6], matrix[10]) * RAD_TO_DEG
    const yaw = -Math.asin(matrix[2]) * RAD_TO_DEG
    if (isNaN(pitch) || isNaN(yaw)) return { pitch: 999, yaw: 999 }
    return { pitch, yaw }
  } catch {
    return { pitch: 999, yaw: 999 }
  }
}
