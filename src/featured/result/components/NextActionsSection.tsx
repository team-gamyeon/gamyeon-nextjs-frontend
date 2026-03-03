'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { Lightbulb } from 'lucide-react'
import type { NextAction } from '@/featured/result/types'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

interface NextActionsSectionProps {
  actions: NextAction[]
}

export function NextActionsSection({ actions }: NextActionsSectionProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      custom={0}
      className="mt-6"
    >
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <Lightbulb className="text-primary h-5 w-5" />
        추천 다음 단계
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {actions.map((action, i) => (
          <motion.div
            key={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i}
          >
            <Card className="group border-border/50 h-full cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="bg-primary/10 mb-2 flex h-9 w-9 items-center justify-center rounded-lg">
                  <span className="text-primary text-sm font-bold">{i + 1}</span>
                </div>
                <h3 className="mb-1 text-sm font-semibold">{action.title}</h3>
                <p className="text-muted-foreground text-xs">{action.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
