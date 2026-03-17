import { DrawingUtils, FaceLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision'

interface IFaceMeshRenderParams {
  canvas: HTMLCanvasElement | null | undefined
  video: HTMLVideoElement
  landmarks: NormalizedLandmark[]
}
export function renderFaceMesh({ canvas, video, landmarks }: IFaceMeshRenderParams) {
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
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
        color: '#C0C0C055',
        lineWidth: 0.5,
      })
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
        color: '#E0E0E0',
        lineWidth: 1.5,
      })
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
        color: '#FF3030',
        lineWidth: 1.5,
      })
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, {
        color: '#FF3030',
        lineWidth: 1.5,
      })
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
        color: '#30FF30',
        lineWidth: 1.5,
      })
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, {
        color: '#30FF30',
        lineWidth: 1.5,
      })
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
        color: '#E0E0E0',
        lineWidth: 1.5,
      })
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, {
        color: '#FF3030',
        lineWidth: 1,
      })
      drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, {
        color: '#30FF30',
        lineWidth: 1,
      })
      ctx.restore()
    }
  }
}
