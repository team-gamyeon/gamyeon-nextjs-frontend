import { Video, ChevronRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { type PermStatus } from '@/featured/interview/types'

interface CameraStepProps {
  cameraStatus: PermStatus
  cameraVideoRef: React.RefObject<HTMLVideoElement | null>
  isLandmarkerReady: boolean
  basePose: { pitch: number; yaw: number } | null
  alignProgress: number
  faceDetected: boolean
  onRequest: () => void
  onConfirm: () => void
  onRetry: () => void
  onSkip: () => void
}

export function CameraStep({
  cameraStatus,
  cameraVideoRef,
  isLandmarkerReady,
  basePose,
  alignProgress,
  faceDetected,
  onRequest,
  onConfirm,
  onRetry,
  onSkip,
}: CameraStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <div className="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
          <Video className="text-primary h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold">카메라 권한 요청 및 테스트</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          면접 영상 녹화를 위해 카메라 접근 권한이 필요합니다.
        </p>
      </div>

      {cameraStatus === 'idle' && (
        <Button variant="outline" className="gap-2" onClick={onRequest}>
          <Video className="h-4 w-4" />
          카메라 권한 요청하기
        </Button>
      )}

      {cameraStatus === 'requesting' && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          권한 요청 중...
        </p>
      )}

      {cameraStatus === 'granted' && (
        <div className="space-y-3">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">
            <video
              ref={cameraVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full -scale-x-100 object-cover"
            />

            {!isLandmarkerReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                <p className="animate-pulse text-xs text-white">AI 분석 준비 중...</p>
              </div>
            )}

            {isLandmarkerReady && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/images/camera_guide_line.png"
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full scale-[1.3] object-contain"
                style={{
                  opacity: basePose ? 1 : alignProgress > 0 ? 0.8 : 0.45,
                  transition: 'opacity 0.3s',
                }}
              />
            )}

            {isLandmarkerReady && (
              <div className="absolute inset-x-0 bottom-3 flex justify-center">
                {basePose ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-green-500/80 px-3 py-1 text-xs text-white backdrop-blur">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    기준 자세 설정 완료
                  </div>
                ) : faceDetected && !alignProgress ? (
                  <div className="flex animate-pulse items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    <AlertCircle className="h-3.5 w-3.5" />
                    가이드 안에 얼굴을 똑바로 맞춰주세요
                  </div>
                ) : alignProgress > 0 ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-blue-500/80 px-3 py-1 text-xs text-white backdrop-blur">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    자세 유지 중 ({Math.ceil(3 * (1 - alignProgress / 100))}초)
                  </div>
                ) : (
                  <div className="rounded-full bg-black/50 px-3 py-1 text-xs text-white/80 backdrop-blur">
                    얼굴을 화면에 맞춰주세요
                  </div>
                )}
              </div>
            )}
          </div>

          {isLandmarkerReady && !basePose && (
            <div className="bg-border h-1 overflow-hidden rounded-full">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-200"
                style={{ width: `${alignProgress}%` }}
              />
            </div>
          )}

          <Button size="sm" className="gap-2" disabled={!basePose} onClick={onConfirm}>
            확인 완료
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {cameraStatus === 'denied' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            카메라 권한이 거부되었습니다. 브라우저 설정에서 허용 후 다시 시도해주세요.
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRetry}>
              다시 시도
            </Button>
            <Button variant="ghost" size="sm" onClick={onSkip}>
              건너뛰기
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
