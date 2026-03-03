'use client'

import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Mic, MicOff, Video, VideoOff, SkipForward, CheckCircle2, ChevronRight } from 'lucide-react'
import type { Phase } from '@/featured/interview/types'
import { QUESTIONS } from '@/featured/interview/types'

interface ControlBarProps {
  micOn: boolean
  cameraOn: boolean
  phase: Phase
  currentQuestion: number
  onToggleMic: () => void
  onToggleCamera: () => void
  onStartInterview: () => void
  onStartAnswering: () => void
  onNext: () => void
}

export function ControlBar({
  micOn,
  cameraOn,
  phase,
  currentQuestion,
  onToggleMic,
  onToggleCamera,
  onStartInterview,
  onStartAnswering,
  onNext,
}: ControlBarProps) {
  return (
    <div className="relative z-20 flex items-center justify-center gap-3 border-t border-white/10 bg-slate-900/80 px-4 py-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        className={`h-12 w-12 rounded-full transition-colors ${micOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
        onClick={onToggleMic}
      >
        {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={`h-12 w-12 rounded-full transition-colors ${cameraOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
        onClick={onToggleCamera}
      >
        {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
      </Button>

      {phase === 'ready' && (
        <Button className="ml-4 gap-2" size="lg" onClick={onStartInterview}>
          면접 시작
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
      {phase === 'thinking' && (
        <Button className="ml-4 gap-2" size="lg" onClick={onStartAnswering}>
          <Mic className="h-4 w-4" />
          답변 시작
        </Button>
      )}
      {phase === 'answering' && (
        <Button variant="secondary" className="ml-4 gap-2" size="lg" onClick={onNext}>
          {currentQuestion < QUESTIONS.length - 1 ? (
            <>
              다음 질문
              <SkipForward className="h-4 w-4" />
            </>
          ) : (
            <>
              면접 완료
              <CheckCircle2 className="h-4 w-4" />
            </>
          )}
        </Button>
      )}
      {phase === 'finished' && (
        <Button className="ml-4 gap-2" size="lg" asChild>
          <Link href="/result">
            결과 보기
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  )
}
