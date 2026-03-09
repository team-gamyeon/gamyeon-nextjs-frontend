'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/shared/ui/card'
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

const videoVariants = {
  hidden: { opacity: 0, height: 0, marginTop: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    marginTop: 12,
    transition: {
      height: { type: 'spring' as const, stiffness: 280, damping: 28 },
      opacity: { duration: 0.2, delay: 0.05 },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: {
      height: { type: 'spring' as const, stiffness: 280, damping: 28 },
      opacity: { duration: 0.15 },
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
      className="mt-6"
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
                className="border-border/50 cursor-pointer overflow-hidden"
                onClick={() => toggle(i)}
              >
                {/* 아코디언 헤더 */}
                <div className="flex w-full items-center gap-3 px-5 pt-5 text-left">
                  <Badge variant="outline" className="shrink-0 text-xs">
                    질문 {i + 1}
                  </Badge>
                  <p className="flex-1 text-sm font-medium">{fb.question}</p>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="shrink-0"
                  >
                    <ChevronDown className="text-muted-foreground h-4 w-4" />
                  </motion.div>
                </div>

                {/* 항상 보이는 피드백 + 열릴 때만 보이는 영상 */}
                <CardContent className="px-5 pt-0 pb-5">
                  {/* 피드백 텍스트 — 항상 표시 */}
                  <p className="text-muted-foreground text-sm leading-relaxed">{fb.feedback}</p>

                  {/* 영상 — 아코디언 열릴 때만 */}
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
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
