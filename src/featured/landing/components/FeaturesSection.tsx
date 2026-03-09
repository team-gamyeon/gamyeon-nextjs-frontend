'use client'

import { motion, type Variants } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { BrainCircuit, Mic, Clock, BarChart3, MessageSquareText, Target } from 'lucide-react'
import type { Feature } from '@/featured/landing/types'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

const features: Feature[] = [
  {
    icon: BrainCircuit,
    title: 'AI 맞춤 질문 생성',
    description: '이력서와 지원 직무를 분석하여 실제 면접에서 나올 수 있는 질문을 생성합니다.',
  },
  {
    icon: MessageSquareText,
    title: '실시간 AI 피드백',
    description: '답변 내용, 논리 구조, 키워드 활용도를 실시간으로 분석하고 개선점을 알려드립니다.',
  },
  {
    icon: Clock,
    title: '시간 관리 분석',
    description:
      '생각 시간과 답변 시간을 정밀하게 측정하여 실전 감각을 키울 수 있도록 도와드립니다.',
  },
  {
    icon: Mic,
    title: '음성 기반 면접',
    description: '실제 면접처럼 음성으로 답변하고, 발화 속도와 자신감을 분석받으세요.',
  },
  {
    icon: BarChart3,
    title: '상세 리포트',
    description: '면접 결과를 다각도로 분석한 리포트로 강점과 보완점을 한눈에 파악하세요.',
  },
  {
    icon: Target,
    title: '직무별 맞춤 연습',
    description: '개발, 마케팅, 기획 등 직무별 특화 질문으로 효율적인 면접 준비가 가능합니다.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28">
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
            합격을 위한 <span className="text-primary">핵심 기능</span>
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground mt-4">
            실전 면접과 동일한 환경에서 AI의 도움으로 체계적으로 준비하세요.
          </motion.p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={fadeUp}
              custom={i}
            >
              <Card className="group border-border/50 bg-card hover:shadow-primary/5 h-full py-4 transition-shadow hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="bg-primary/10 group-hover:bg-primary/15 mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-colors">
                    <feature.icon className="text-primary h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
