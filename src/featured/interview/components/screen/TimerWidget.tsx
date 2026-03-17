'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CircularTimer } from '@/featured/interview/components/screen/CircularTimer'
import type { Phase } from '@/featured/interview/types'
import { TOTAL_ANSWER_TIME, TOTAL_THINK_TIME } from '@/featured/interview/constants'

interface TimerWidgetProps {
  isActive: boolean
  phase: Phase
  timeLeft: number
}

export function TimerWidget({ isActive, phase, timeLeft }: TimerWidgetProps) {
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
