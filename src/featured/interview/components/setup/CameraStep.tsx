import Image from 'next/image'
import { AlertCircle, CheckCircle2, ChevronRight, Loader2, Video } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { type PermStatus } from '@/featured/interview/types'

interface CameraStepProps {
  cameraStatus: PermStatus
  cameraVideoRef: React.RefCallback<HTMLVideoElement>
  isLandmarkerReady: boolean
  basePose: { pitch: number; yaw: number } | null
  alignProgress: number
  faceDetected: boolean
  onRequest: () => void
  onConfirm: () => void
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
        <Button variant="outline" className="cursor-pointer gap-2" onClick={onRequest}>
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
              <Image
                src="/images/camera_guide_line3.png"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="pointer-events-none absolute inset-0 h-full w-full scale-[1.3] object-contain"
                style={{
                  opacity: basePose ? 0.8 : alignProgress > 0 ? 0.8 : 0.45,
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
                    가이드 안에 얼굴이 오도록 맞춰주세요
                  </div>
                ) : alignProgress > 0 ? (
                  <div className="flex items-center gap-1.5 rounded-full bg-blue-500/80 px-3 py-1 text-xs text-white backdrop-blur">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    자세 측정 중 ({Math.ceil(3 * (1 - alignProgress / 100))}초)
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

          <Button
            size="sm"
            className="cursor-pointer gap-2"
            disabled={!basePose}
            onClick={onConfirm}
          >
            확인 완료
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {cameraStatus === 'denied' && (
        <div className="space-y-4">
          <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-start gap-3 rounded-xl border px-4 py-4 text-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <p className="font-bold">카메라 접근이 차단되었습니다.</p>
              <p className="text-xs leading-relaxed opacity-90">
                브라우저 주소창 왼쪽의 <b>🔒 또는 ⓘ 아이콘</b>을 클릭하여 카메라 권한을{' '}
                <b>&apos;허용&apos;</b>으로 변경한 뒤 아래 버튼을 다시 눌러주세요.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border">
            <div className="bg-muted/40 px-4 py-2.5 text-xs font-medium text-gray-600">
              권한 설정 방법
            </div>
            <div className="relative aspect-video w-full bg-gray-100">
              <Image
                src="/images/permission_guide.png"
                alt="브라우저 권한 설정 가이드 — 주소창 좌측 아이콘 클릭 후 카메라 허용"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <Button className="w-full gap-2 py-6 text-base shadow-lg" onClick={onRequest}>
            <Video className="h-4 w-4" />
            설정 완료 및 카메라 테스트 시작
          </Button>
        </div>
      )}
    </div>
  )
}
