'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { TrendingUp, TrendingDown, ThumbsUp, AlertTriangle } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

interface StrengthsImprovementsSectionProps {
  strengths: string[]
  improvements: string[]
}

export function StrengthsImprovementsSection({
  strengths,
  improvements,
}: StrengthsImprovementsSectionProps) {
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={0}
      >
        <Card className="border-border/50 h-full">
          <CardHeader className="pb-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-green-700">
              <ThumbsUp className="h-5 w-5" />
              잘한 점
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                <p className="text-sm">{s}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={1}
      >
        <Card className="border-border/50 h-full">
          <CardHeader className="pb-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-amber-700">
              <AlertTriangle className="h-5 w-5" />
              개선할 점
            </h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {improvements.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <p className="text-sm">{s}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
