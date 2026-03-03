'use client'

import { motion } from 'framer-motion'
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

interface QuestionFeedbackSectionProps {
  feedbacks: FeedbackItem[]
}

export function QuestionFeedbackSection({ feedbacks }: QuestionFeedbackSectionProps) {
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
      <div className="space-y-4">
        {feedbacks.map((fb, i) => (
          <motion.div
            key={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i}
          >
            <Card className="border-border/50">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        질문 {i + 1}
                      </Badge>
                      <div className="flex gap-1.5">
                        {fb.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm font-medium">{fb.question}</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                      fb.score >= 80
                        ? 'bg-green-100 text-green-700'
                        : fb.score >= 70
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {fb.score}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{fb.feedback}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
