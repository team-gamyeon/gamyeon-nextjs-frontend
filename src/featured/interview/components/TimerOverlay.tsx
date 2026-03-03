'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/ui/button'
import { Mic, SkipForward, CheckCircle2 } from 'lucide-react'
import { CircularTimer } from '@/featured/interview/components/circular-timer'
import type { Phase } from '@/featured/interview/types'
import { QUESTIONS, TOTAL_THINK_TIME, TOTAL_ANSWER_TIME } from '@/featured/interview/types'

interface TimerOverlayProps {
  isActive: boolean
  phase: Phase
  timeLeft: number
  currentQuestion: number
  onStartAnswering: () => void
  onNext: () => void
}

export function TimerOverlay({
  isActive,
  phase,
  timeLeft,
  currentQuestion,
  onStartAnswering,
  onNext,
}: TimerOverlayProps) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute top-1/2 right-5 -translate-y-1/2"
        >
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-2xl backdrop-blur-md">
            <CircularTimer
              timeLeft={timeLeft}
              totalTime={phase === 'thinking' ? TOTAL_THINK_TIME : TOTAL_ANSWER_TIME}
              mode={phase as 'thinking' | 'answering'}
              size={120}
            />
            {phase === 'thinking' && (
              <Button size="sm" className="w-full gap-1.5 text-xs" onClick={onStartAnswering}>
                <Mic className="h-3.5 w-3.5" />
                답변 시작
              </Button>
            )}
            {phase === 'answering' && (
              <Button
                size="sm"
                variant="secondary"
                className="w-full gap-1.5 text-xs"
                onClick={onNext}
              >
                {currentQuestion < QUESTIONS.length - 1 ? (
                  <>
                    <SkipForward className="h-3.5 w-3.5" />
                    다음 질문
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    완료
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
