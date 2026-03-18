import Image from 'next/image'
import {
  Mic,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Square,
  Play,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { VuMeter } from '@/featured/interview/components/setup/VuMeter'
import { type PermStatus } from '@/featured/interview/types'
import { type RecordingStatus } from '@/featured/interview/types'

interface MicStepProps {
  micStatus: PermStatus
  audioLevel: number
  onRequest: () => void
  onConfirm: () => void
  onRetry: () => void
  recordingStatus: RecordingStatus
  isPlaying: boolean
  recordedDuration: number
  playbackProgress: number
  onStartRecording: () => void
  onStopRecording: () => void
  onPlayRecording: () => void
}

export function MicStep({
  micStatus,
  audioLevel,
  onRequest,
  onConfirm,
  onRetry,
  recordingStatus,
  isPlaying,
  recordedDuration,
  playbackProgress,
  onStartRecording,
  onStopRecording,
  onPlayRecording,
}: MicStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <div className="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
          <Mic className="text-primary h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold">마이크 권한 요청 및 테스트</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          답변 인식을 위해 마이크 접근 권한이 필요합니다.
        </p>
      </div>

      {micStatus === 'idle' && (
        <Button variant="outline" className="cursor-pointer gap-2" onClick={onRequest}>
          <Mic className="h-4 w-4" />
          마이크 권한 요청하기
        </Button>
      )}

      {micStatus === 'requesting' && (
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          권한 요청 중...
        </p>
      )}

      {micStatus === 'granted' && (
        <div className="space-y-3">
          <VuMeter level={audioLevel} />
          <p className="flex items-center gap-1.5 text-xs text-green-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            마이크가 감지되었습니다. 말해보세요!
          </p>

          {/* 녹음 테스트 카드 */}
          <div className="bg-muted/40 space-y-3 rounded-xl border px-4 py-3">
            <p className="text-muted-foreground text-xs font-medium">녹음 테스트</p>

            {recordingStatus === 'idle' && (
              <button onClick={onStartRecording} className="group flex w-full items-center gap-3">
                <div className="bg-primary/10 group-hover:bg-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors">
                  <Mic className="text-primary h-5 w-5 cursor-pointer" />
                </div>
                <div className="text-left">
                  <p className="cursor-pointer text-sm font-medium">녹음 시작하기</p>
                  <p className="text-muted-foreground text-xs">클릭해서 마이크를 테스트해 보세요</p>
                </div>
              </button>
            )}

            {recordingStatus === 'recording' && (
              <button onClick={onStopRecording} className="group flex w-full items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-red-500 transition-colors group-hover:bg-red-600">
                    <Square className="h-4 w-4 fill-white text-white" />
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-red-600">녹음 중...</p>
                  <p className="text-muted-foreground text-xs">클릭해서 중지하세요</p>
                </div>
              </button>
            )}

            {recordingStatus === 'recorded' && (
              <div className="space-y-2.5">
                <button
                  onClick={onPlayRecording}
                  disabled={isPlaying}
                  className="group flex w-full items-center gap-3 disabled:opacity-60"
                >
                  <div className="bg-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity group-hover:opacity-90">
                    <Play className="ml-0.5 h-4 w-4 fill-white text-white" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    {/* 프로그레스바 */}
                    <div className="bg-muted-foreground/20 relative h-1.5 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{ width: `${playbackProgress * 100}%` }}
                      />
                    </div>
                    {/* 현재시간 / 전체길이 */}
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-xs">
                        {isPlaying ? '재생 중...' : '녹음 듣기'}
                      </p>
                      <span className="text-muted-foreground font-mono text-xs">
                        {String(
                          Math.floor(Math.round(playbackProgress * recordedDuration) / 60),
                        ).padStart(2, '0')}
                        :
                        {String(Math.round(playbackProgress * recordedDuration) % 60).padStart(
                          2,
                          '0',
                        )}
                        {' / '}
                        {String(Math.floor(recordedDuration / 60)).padStart(2, '0')}:
                        {String(recordedDuration % 60).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </button>
                <button
                  onClick={onStartRecording}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  다시 녹음
                </button>
              </div>
            )}
          </div>

          <Button size="sm" className="cursor-pointer gap-2" onClick={onConfirm}>
            확인 완료
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {micStatus === 'denied' && (
        <div className="space-y-4">
          <div className="bg-destructive/10 text-destructive border-destructive/20 flex items-start gap-3 rounded-xl border px-4 py-4 text-sm">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <p className="font-bold">마이크 접근이 차단되었습니다.</p>
              <p className="text-xs leading-relaxed opacity-90">
                브라우저 주소창 왼쪽의 <b>🔒 또는 ⓘ 아이콘</b>을 클릭하여 마이크 권한을{' '}
                <b>&apos;허용&apos;</b>으로 변경한 뒤 아래 버튼을 눌러주세요.
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
                alt="브라우저 권한 설정 가이드 — 주소창 좌측 아이콘 클릭 후 마이크 허용"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button className="w-full gap-2 py-6 text-base shadow-lg" onClick={onRequest}>
              <Mic className="h-4 w-4" />
              설정 완료 및 마이크 테스트 시작
            </Button>

            <div className="flex justify-center">
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onRetry}>
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
