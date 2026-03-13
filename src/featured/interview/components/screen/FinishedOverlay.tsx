'use client'

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/ui/button'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import type { Phase } from '@/featured/interview/types'
import { finishInterviewAction } from '@/featured/interview/actions/interview.action'

interface FinishedOverlayProps {
  phase: Phase
  intvId: number
}

export function FinishedOverlay({ phase, intvId }: FinishedOverlayProps) {
  const router = useRouter()

  async function handleGoToHistory() {
    try {
      await finishInterviewAction(intvId)
    } finally {
      router.push('/history')
    }
  }

  return (
    <AnimatePresence>
      {phase === 'finished' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <CheckCircle2 className="h-9 w-9 text-green-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-300">면접이 완료되었습니다</p>
              <p className="mt-2 text-sm text-white/70">
                수고하셨습니다! AI가 답변을 정밀 분석 중입니다. <br />
                분석 완료까지 <strong>약 3~5분이 소요</strong>되며, 면접 기록에서 확인 가능합니다.
              </p>
            </div>
            <Button size="lg" className="mt-2 gap-2 px-8" onClick={handleGoToHistory}>
              나의 면접 기록 보기
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
