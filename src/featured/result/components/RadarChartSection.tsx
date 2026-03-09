'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { RadarChart } from '@/featured/result/components/radar-chart'
import type { RadarDataPoint } from '@/featured/result/types'

interface RadarChartSectionProps {
  data: RadarDataPoint[]
}

export function RadarChartSection({ data }: RadarChartSectionProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { delay: 0.16, duration: 0.4, ease: 'easeOut' } },
      }}
      className="lg:col-span-2"
    >
      <Card className="border-border/50 shadow-primary/5 shadow-lg">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">역량 분석</h2>
          <p className="text-muted-foreground text-sm">5가지 핵심 역량별 점수입니다</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-6">
          <RadarChart data={data} />
          <div className="mt-4 grid w-full grid-cols-3 gap-2">
            {data.map((d) => (
              <div
                key={d.label}
                className="bg-muted/50 flex items-center justify-between rounded-lg px-3 py-2"
              >
                <span className="text-muted-foreground text-xs">{d.label}</span>
                <span className="text-sm font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
