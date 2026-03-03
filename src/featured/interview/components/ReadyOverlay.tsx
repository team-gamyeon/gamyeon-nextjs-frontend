'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/ui/button'
import { MessageSquare, ChevronRight } from 'lucide-react'
import type { Phase } from '@/featured/interview/types'

interface ReadyOverlayProps {
  phase: Phase
  onStart: () => void
}

export function ReadyOverlay({ phase, onStart }: ReadyOverlayProps) {
  return (
    <AnimatePresence>
      {phase === 'ready' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="bg-primary/20 flex h-20 w-20 items-center justify-center rounded-full">
              <MessageSquare className="text-primary h-9 w-9" />
            </div>
            <div>
              <p className="text-xl font-bold">면접 준비 완료</p>
              <p className="mt-1 text-sm text-white/50">
                시작하면 첫 질문이 화면 상단에 나타납니다
              </p>
            </div>
            <Button size="lg" className="mt-2 gap-2 px-8" onClick={onStart}>
              면접 시작
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
