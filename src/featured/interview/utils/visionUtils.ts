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
    // MediaPipe의 4x4 변환 행렬에서 회전 정보 추출
    const pitch = Math.atan2(matrix[6], matrix[10]) * RAD_TO_DEG // 상하 반전 보정
    const yaw = -Math.asin(matrix[2]) * RAD_TO_DEG // 좌우 반전 보정

    // NaN 방지 처리
    return {
      pitch: isNaN(pitch) ? 0 : pitch,
      yaw: isNaN(yaw) ? 0 : yaw,
    }
  } catch (e) {
    return { pitch: 0, yaw: 0 }
  }
}

const LEFT_EYE = [33, 160, 158, 133, 153, 144]
const RIGHT_EYE = [362, 385, 387, 263, 373, 380]
const EAR_THRESHOLD = 0.22

export { getDistance, calculateEAR, extractEulerAngles, LEFT_EYE, RIGHT_EYE, EAR_THRESHOLD }
