'use client'

import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { Button } from '@/shared/ui/button'
import { ArrowRight } from 'lucide-react'

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' as const },
  }),
}

export function CtaSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="bg-primary group relative overflow-hidden rounded-3xl px-8 py-16 text-center sm:px-16 cursor-pointer"
          onClick={() => window.location.href = '/dashboard'}
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          </div>
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="text-primary-foreground text-3xl font-bold tracking-tight sm:text-4xl"
          >
            지금 바로 면접 연습을 시작하세요
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-primary-foreground/80 mx-auto mt-4 max-w-lg"
          >
            무료 체험 3회로 InterviewAI의 효과를 직접 경험해 보세요. 가입만 하면 바로 시작할 수
            있습니다.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="mt-8">
            <Button size="lg" variant="secondary" className="gap-2 font-semibold pointer-events-none transition-colors group-hover:bg-secondary/80" asChild>
              <Link href="/dashboard">
                무료로 시작하기
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
