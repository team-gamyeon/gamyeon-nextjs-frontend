'use client'

import { motion, type Variants } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { Star, Users } from 'lucide-react'
import type { Testimonial } from '@/featured/landing/types'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

const testimonials: Testimonial[] = [
  {
    name: '김서연',
    role: '프론트엔드 개발자 취준생',
    content:
      '실제 면접에서 받은 질문과 거의 비슷해서 놀랐어요. 덕분에 자신감 있게 면접에 임할 수 있었습니다.',
    rating: 5,
  },
  {
    name: '이준호',
    role: '마케팅 직무 지원자',
    content: '시간 관리 피드백이 정말 유용했어요. 답변 시간을 줄이는 연습을 할 수 있었습니다.',
    rating: 5,
  },
  {
    name: '박지민',
    role: '데이터 분석가 취준생',
    content: '혼자 준비하면 놓치기 쉬운 부분을 AI가 정확히 짚어줘서 큰 도움이 됐어요.',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            사용자 <span className="text-primary">후기</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground mt-4">
            이미 수많은 취준생이 InterviewAI로 면접을 준비하고 있습니다.
          </motion.p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
              custom={i}
            >
              <Card className="border-border/50 h-full py-4">
                <CardContent className="p-6">
                  <div className="mb-3 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-9 w-9 items-center justify-center rounded-full">
                      <Users className="text-primary h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-muted-foreground text-xs">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
