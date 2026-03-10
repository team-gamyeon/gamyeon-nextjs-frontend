import { Mic, ChevronRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { VuMeter } from '@/featured/interview/components/setup/VuMeter'
import { type PermStatus } from '@/featured/interview/types'

interface MicStepProps {
  micStatus: PermStatus
  audioLevel: number
  onRequest: () => void
  onConfirm: () => void
  onRetry: () => void
  onSkip: () => void
}

export function MicStep({
  micStatus,
  audioLevel,
  onRequest,
  onConfirm,
  onRetry,
  onSkip,
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
        <Button variant="outline" className="gap-2" onClick={onRequest}>
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
          <Button size="sm" className="gap-2" onClick={onConfirm}>
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
                주소창 왼쪽의 <b>설정</b> 아이콘을 클릭하여 마이크 권한을 <b>'허용'</b>으로 변경한
                뒤 아래 버튼을 눌러주세요.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button className="w-full gap-2 py-6 text-base shadow-lg" onClick={onRequest}>
              <Mic className="h-4 w-4" />
              설정 완료 및 마이크 테스트 시작
            </Button>

            <div className="flex justify-center gap-2">
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onRetry}>
                다시 시도
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onSkip}>
                건너뛰기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
