'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  CheckCircle2,
  Video,
  Mic,
  ChevronRight,
  Upload,
  AlertCircle,
  Loader2,
  X,
  FileText,
  FolderOpen,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export interface InterviewSetupConfig {
  title: string
}

interface Props {
  open: boolean
  onComplete: (config: InterviewSetupConfig) => void
  onCancel: () => void
}

type StepStatus = 'pending' | 'active' | 'done'
type PermStatus = 'idle' | 'requesting' | 'granted' | 'denied'

const STEPS = [
  { id: 1, label: '면접 제목', icon: FileText },
  { id: 2, label: '카메라 권한', icon: Video },
  { id: 3, label: '마이크 권한', icon: Mic },
  { id: 4, label: '문서 업로드', icon: FolderOpen },
] as const

function VuMeter({ level }: { level: number }) {
  const BARS = 22
  return (
    <div className="bg-muted flex h-9 items-end gap-0.5 rounded-xl px-3 py-2">
      {Array.from({ length: BARS }, (_, i) => {
        const threshold = i / BARS
        const active = level > threshold
        const color =
          threshold < 0.6 ? 'bg-green-500' : threshold < 0.8 ? 'bg-yellow-400' : 'bg-red-500'
        return (
          <div
            key={i}
            className={cn(
              'flex-1 rounded-sm transition-all duration-75',
              active ? color : 'bg-muted-foreground/20',
            )}
            style={{ height: '100%' }}
          />
        )
      })}
    </div>
  )
}

function SidebarStep({ step, status }: { step: (typeof STEPS)[number]; status: StepStatus }) {
  const Icon = step.icon
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200',
        status === 'active' && 'bg-primary/10',
        status === 'pending' && 'opacity-40',
      )}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
        {status === 'done' ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold',
              status === 'active'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground/30 text-muted-foreground/50',
            )}
          >
            {step.id}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            'h-4 w-4 shrink-0',
            status === 'active'
              ? 'text-primary'
              : status === 'done'
                ? 'text-green-500'
                : 'text-muted-foreground/50',
          )}
        />
        <span
          className={cn(
            'text-sm font-medium',
            status === 'active' && 'text-primary',
            status === 'done' && 'text-foreground',
            status === 'pending' && 'text-muted-foreground',
          )}
        >
          {step.label}
        </span>
      </div>
    </div>
  )
}

export function InterviewSetupModal({ open, onComplete, onCancel }: Props) {
  const [statuses, setStatuses] = useState<StepStatus[]>([
    'active',
    'pending',
    'pending',
    'pending',
  ])

  const currentStep = statuses.findIndex((s) => s === 'active') + 1 || 5
  const doneCount = statuses.filter((s) => s === 'done').length
  const allDone = doneCount === 4

  const [title, setTitle] = useState('')
  const [cameraStatus, setCameraStatus] = useState<PermStatus>('idle')
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const cameraVideoRef = useRef<HTMLVideoElement>(null)
  const [micStatus, setMicStatus] = useState<PermStatus>('idle')
  const [audioLevel, setAudioLevel] = useState(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const levelIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [resume, setResume] = useState<File | null>(null)
  const [portfolio, setPortfolio] = useState<File | null>(null)
  const [selfIntro, setSelfIntro] = useState<File | null>(null)
  const hasAnyDoc = !!(resume || portfolio || selfIntro)

  const completeStep = (step: number) => {
    setStatuses((prev) => {
      const next = [...prev] as StepStatus[]
      next[step - 1] = 'done'
      if (step < 4) next[step] = 'active'
      return next
    })
  }

  useEffect(() => {
    if (cameraStatus === 'granted' && cameraVideoRef.current && cameraStream) {
      cameraVideoRef.current.srcObject = cameraStream
    }
  }, [cameraStatus, cameraStream])

  useEffect(() => {
    if (micStatus !== 'granted') return
    levelIntervalRef.current = setInterval(() => {
      if (!analyserRef.current) return
      const data = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(data)
      const avg = data.reduce((a, b) => a + b, 0) / data.length
      setAudioLevel(Math.min(1, avg / 60))
    }, 80)
    return () => {
      if (levelIntervalRef.current) clearInterval(levelIntervalRef.current)
    }
  }, [micStatus])

  useEffect(() => {
    return () => {
      if (levelIntervalRef.current) clearInterval(levelIntervalRef.current)
      audioCtxRef.current?.close()
      micStreamRef.current?.getTracks().forEach((t) => t.stop())
      cameraStream?.getTracks().forEach((t) => t.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTitleConfirm = () => {
    if (title.trim()) completeStep(1)
  }

  const requestCamera = async () => {
    setCameraStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      setCameraStream(stream)
      setCameraStatus('granted')
    } catch {
      setCameraStatus('denied')
    }
  }

  const confirmCamera = () => {
    cameraStream?.getTracks().forEach((t) => t.stop())
    setCameraStream(null)
    completeStep(2)
  }

  const requestMic = async () => {
    setMicStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream
      const ctx = new AudioContext()
      audioCtxRef.current = ctx
      const analyser = ctx.createAnalyser()
      analyserRef.current = analyser
      analyser.fftSize = 256
      ctx.createMediaStreamSource(stream).connect(analyser)
      setMicStatus('granted')
    } catch {
      setMicStatus('denied')
    }
  }

  const confirmMic = () => {
    if (levelIntervalRef.current) clearInterval(levelIntervalRef.current)
    audioCtxRef.current?.close()
    audioCtxRef.current = null
    micStreamRef.current?.getTracks().forEach((t) => t.stop())
    micStreamRef.current = null
    setAudioLevel(0)
    completeStep(3)
  }

  const makeFileHandler =
    (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.files?.[0] ?? null)
    }

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <div className="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
                <FileText className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">면접 제목 입력</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                이번 면접의 제목이나 포지션명을 입력해주세요.
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="예: 프론트엔드 개발자 면접"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleConfirm()}
                autoFocus
                className="flex-1"
              />
              <Button
                disabled={!title.trim()}
                onClick={handleTitleConfirm}
                className="shrink-0 gap-1"
              >
                확인
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )
      case 2:
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
              <Button variant="outline" className="gap-2" onClick={requestCamera}>
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
                <div className="aspect-video overflow-hidden rounded-xl bg-slate-900">
                  <video
                    ref={cameraVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full -scale-x-100 object-cover"
                  />
                </div>
                <p className="flex items-center gap-1.5 text-xs text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  카메라가 정상적으로 감지되었습니다
                </p>
                <Button size="sm" className="gap-2" onClick={confirmCamera}>
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
                  <Button variant="outline" size="sm" onClick={() => setCameraStatus('idle')}>
                    다시 시도
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => completeStep(2)}>
                    건너뛰기
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      case 3:
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
              <Button variant="outline" className="gap-2" onClick={requestMic}>
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
                <Button size="sm" className="gap-2" onClick={confirmMic}>
                  확인 완료
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            {micStatus === 'denied' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  마이크 권한이 거부되었습니다. 브라우저 설정에서 허용 후 다시 시도해주세요.
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setMicStatus('idle')}>
                    다시 시도
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => completeStep(3)}>
                    건너뛰기
                  </Button>
                </div>
              </div>
            )}
          </div>
        )
      case 4:
        return (
          <div className="space-y-5">
            <div>
              <div className="bg-primary/10 mb-3 flex h-12 w-12 items-center justify-center rounded-2xl">
                <FolderOpen className="text-primary h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">문서 업로드</h3>
              <p className="text-muted-foreground mt-1 text-sm">
                이력서, 포트폴리오, 자기소개서를 업로드하면 AI가 맞춤 질문을 준비합니다.
              </p>
            </div>
            <div className="space-y-2">
              {(
                [
                  { label: '(필수) 이력서', file: resume, setter: setResume },
                  { label: '(선택) 포트폴리오', file: portfolio, setter: setPortfolio },
                  { label: '(선택) 자기소개서', file: selfIntro, setter: setSelfIntro },
                ] as { label: string; file: File | null; setter: (f: File | null) => void }[]
              ).map(({ label, file, setter }) => (
                <div key={label}>
                  {file ? (
                    <div className="flex items-center gap-2.5 rounded-xl bg-green-50 px-4 py-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                      <span className="flex-1 truncate text-sm font-medium text-green-700">
                        {file.name}
                      </span>
                      <button
                        onClick={() => setter(null)}
                        className="shrink-0 text-green-400 transition-colors hover:text-green-700"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-border hover:bg-muted/30 flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed px-4 py-2.5 transition-colors">
                      <Upload className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                      <span className="text-muted-foreground text-sm">{label} 업로드</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.hwp,.txt"
                        onChange={makeFileHandler(setter)}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                disabled={!hasAnyDoc}
                className="gap-2"
                onClick={() => completeStep(4)}
              >
                완료
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => completeStep(4)}>
                건너뛰기
              </Button>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold">모든 설정이 완료되었습니다!</h3>
            <p className="text-muted-foreground mt-1.5 text-sm">면접을 시작할 준비가 되었습니다.</p>
          </div>
        )
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-7xl min-w-4xl overflow-hidden p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex min-h-155">
          <aside className="border-border/60 bg-muted/30 flex w-64 shrink-0 flex-col border-r">
            <div className="border-border/50 border-b px-5 py-5">
              <p className="text-sm leading-tight font-bold">면접 환경 설정</p>
              <p className="text-muted-foreground mt-1 text-xs">{doneCount} / 4 단계 완료</p>
              <div className="bg-border mt-3 h-1 overflow-hidden rounded-full">
                <motion.div
                  className="bg-primary h-full rounded-full"
                  animate={{ width: `${(doneCount / 4) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>
            <nav className="flex-1 space-y-0.5 p-3">
              {STEPS.map((step) => (
                <SidebarStep key={step.id} step={step} status={statuses[step.id - 1]} />
              ))}
            </nav>
          </aside>
          <div className="flex flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-8 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {renderContent()}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="border-border/50 flex items-center justify-between border-t px-8 py-4">
              <Button variant="ghost" size="sm" onClick={onCancel}>
                취소
              </Button>
              <Button
                disabled={!allDone}
                onClick={() => onComplete({ title: title.trim() || '모의 면접' })}
                className="gap-2"
              >
                면접 시작하기
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
