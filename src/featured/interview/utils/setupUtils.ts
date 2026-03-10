import { ALIGN_THRESHOLD } from '@/featured/interview/constants'

const extractSetupEulerAngles = (
  matrix: number[] | Float32Array,
): { pitch: number; yaw: number } => {
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

const validateFacePosition = (result: any, matrixes: any) => {
  if (!result.faceLandmarks?.[0] || !matrixes?.[0]) return { inPosition: false, pitch: 0, yaw: 0 }

  // 코 중앙 고정 + 얼굴 크기 + 대칭 + 각도 — 4박자 통과 조건
  const landmarks = result.faceLandmarks[0]
  const noseTip = landmarks[1]
  const leftCheek = landmarks[234]
  const rightCheek = landmarks[454]

  const isNoseCentered = noseTip.x > 0.45 && noseTip.x < 0.55 && noseTip.y > 0.4 && noseTip.y < 0.6

  const faceWidth = Math.abs(leftCheek.x - rightCheek.x)
  const isProperSize = faceWidth > 0.2 && faceWidth < 0.35

  const leftDist = Math.abs(noseTip.x - leftCheek.x)
  const rightDist = Math.abs(rightCheek.x - noseTip.x)
  const symmetryRatio = rightDist > 0 ? leftDist / rightDist : 0
  const isSymmetric = symmetryRatio > 0.7 && symmetryRatio < 1.3

  const rawMatrix = (matrixes[0] as any).data ?? matrixes[0]
  const { pitch, yaw } = extractSetupEulerAngles(rawMatrix)
  const isStraight = Math.abs(pitch) < ALIGN_THRESHOLD && Math.abs(yaw) < ALIGN_THRESHOLD

  return {
    inPosition: isNoseCentered && isProperSize && isSymmetric && isStraight,
    pitch,
    yaw,
  }
}

export { extractSetupEulerAngles, validateFacePosition }
