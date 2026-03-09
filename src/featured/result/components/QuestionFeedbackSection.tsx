'use client'

import { useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Card } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import type { FeedbackItem } from '@/featured/result/types'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

const videoVariants: Variants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    marginTop: 12,
    transition: {
      height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
      marginTop: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
      opacity: { duration: 0.25, delay: 0.1 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      height: { duration: 0.3, ease: 'easeInOut' },
      marginTop: { duration: 0.3, ease: 'easeInOut' },
      opacity: { duration: 0.2 },
    },
  },
}

interface QuestionFeedbackSectionProps {
  feedbacks: FeedbackItem[]
}

export function QuestionFeedbackSection({ feedbacks }: QuestionFeedbackSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i))

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={0}
      className="mt-3"
    >
      <h2 className="mb-4 text-lg font-semibold">질문별 피드백</h2>
      <div className="space-y-3">
        {feedbacks.map((fb, i) => {
          const isOpen = openIndex === i

          return (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
            >
              <Card
                className="border-border/50 cursor-pointer flex-row items-center gap-3 overflow-hidden px-5 py-8"
                onClick={() => toggle(i)}
              >
                {/* 질문 + 피드백 + 영상 */}
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="shrink-0 text-xs">
                      질문 {i + 1}
                    </Badge>
                    <p className="flex-1 text-sm font-medium">{fb.question}</p>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{fb.feedback}</p>
                  <AnimatePresence initial={false}>
                    {isOpen && fb.videoUrl && (
                      <motion.div
                        key="video"
                        variants={videoVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="overflow-hidden"
                      >
                        <div className="bg-muted mx-auto w-3/4 overflow-hidden rounded-lg">
                          <div className="aspect-video">
                            <video
                              src={fb.videoUrl}
                              controls
                              className="h-full w-full object-cover"
                              preload="metadata"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 아코디언 아이콘 — 카드 세로 중앙 */}
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="shrink-0 self-start"
                >
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                </motion.div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
