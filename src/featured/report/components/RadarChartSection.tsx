'use client'

import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
import { RadarChart } from '@/featured/report/components/RadarChart'
import type { CompetencyScores, RadarDataPoint } from '@/featured/report/types'
import { COMPETENCY_MAP } from '../constants'

const CHART_SIZE = 360
const CONTAINER_HEIGHT = 360

const CARD_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.16, duration: 0.4, ease: 'easeOut' as const },
  },
}

interface RadarChartSectionProps {
  data: CompetencyScores
}

export function RadarChartSection({ data }: RadarChartSectionProps) {
  // [데이터 가공 로직] 백엔드 데이터(data) + 한글/설명 사전(COMPETENCY_MAP) = 차트용 배열(chartData)
  const chartData: RadarDataPoint[] = Object.keys(COMPETENCY_MAP).map((key) => {
    const k = key as keyof CompetencyScores
    return {
      label: COMPETENCY_MAP[k].label,
      value: data[k],
      description: COMPETENCY_MAP[k].description,
    }
  })

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={CARD_ANIMATION_VARIANTS}
      className="lg:col-span-2"
    >
      <Card className="border-border/50 shadow-primary/5 py-6 shadow-lg">
        <CardHeader className="pb-2">
          <h2 className="text-lg font-semibold">역량 분석</h2>
          <p className="text-muted-foreground text-sm">5가지 핵심 역량별 점수입니다</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-6">
          <div
            style={{
              height: CONTAINER_HEIGHT,
              overflow: 'visible',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* 자식 컴포넌트인 RadarChart에는 변환된 배열(chartData)을 넘깁니다 */}
            <RadarChart data={chartData} size={CHART_SIZE} />
          </div>

          <TooltipProvider>
            <div className="mt-4 flex w-full gap-2">
              {/* 원본 data 대신 가공된 chartData를 순회하며 UI를 그립니다 */}
              {chartData.map((d) => (
                <div
                  key={d.label}
                  className="bg-muted/50 flex flex-1 flex-col items-center rounded-lg px-2 py-2"
                >
                  <Tooltip>
                    <div className="group flex items-center gap-0.5">
                      <span className="text-muted-foreground text-center text-xs transition-all duration-150">
                        {d.label}
                      </span>
                      <TooltipTrigger asChild>
                        <Info className="text-muted-foreground/50 group-hover:text-foreground/70 h-3 w-3 shrink-0 cursor-pointer transition-colors duration-150" />
                      </TooltipTrigger>
                    </div>
                    <TooltipContent
                      side="top"
                      sideOffset={18}
                      className="w-52 border text-wrap break-keep"
                      style={{
                        backgroundColor: '#F2F2F2',
                        borderColor: '#E0E0E0',
                        color: '#555555',
                      }}
                    >
                      <p className="leading-relaxed">{d.description}</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="mt-1 text-sm font-semibold">{d.value}</span>
                </div>
              ))}
            </div>
          </TooltipProvider>
        </CardContent>
      </Card>
    </motion.div>
  )
}
