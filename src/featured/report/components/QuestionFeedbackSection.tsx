'use client'

import { useState } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { ChevronDown, MessageCircleCheck, Lightbulb } from 'lucide-react'
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
    marginTop: 16,
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
      className="mt-10"
    >
      <h2 className="text-foreground mb-5 text-xl font-bold tracking-tight">질문별 피드백</h2>
      <div className="space-y-4">
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
                className="border-border/60 hover:bg-accent/5 flex cursor-pointer flex-row items-start gap-5 overflow-hidden px-6 py-7 shadow-sm transition-all"
                onClick={() => toggle(i)}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-none bg-[oklch(0.55_0.15_180)] px-3 py-0.5 text-xs font-semibold text-white hover:opacity-90">
                      질문 {i + 1}
                    </Badge>
                    {fb.feedback_badges.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="border-none bg-[oklch(0.55_0.15_180/0.1)] px-2.5 py-0.5 font-medium text-[oklch(0.45_0.12_180)]"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* 질문 텍스트 */}
                  <h3 className="text-foreground/90 text-[17px] leading-snug font-bold tracking-tight">
                    {fb.question}
                  </h3>

                  {/* 요약 & 피드백 리스트 */}
                  <div className="space-y-4 pt-1">
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 rounded-full bg-blue-50 p-1.5">
                        <MessageCircleCheck className="h-4 w-4 text-blue-600" />
                      </div>
                      <p className="text-muted-foreground flex-1 pt-1 text-[14.5px] leading-relaxed">
                        {fb.answer_summary}
                      </p>
                    </div>

                    {/* 피드백 */}
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 rounded-full bg-amber-50 p-1.5">
                        <Lightbulb className="h-4 w-4 text-amber-600" />
                      </div>
                      <p className="text-foreground/80 flex-1 pt-1 text-[14.5px] leading-relaxed font-medium">
                        {fb.feedback}
                      </p>
                    </div>
                  </div>

                  {/* 비디오 영역 */}
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
                        <div className="border-border/40 mx-auto w-full overflow-hidden rounded-xl border bg-black/5 shadow-inner">
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

                {/* 아코디언 화살표 */}
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="mt-12 shrink-0"
                >
                  <ChevronDown className="text-muted-foreground/50 h-5 w-5" />
                </motion.div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
