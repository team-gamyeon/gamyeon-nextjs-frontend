'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
import { Info } from 'lucide-react'
import { RadarChart } from '@/featured/result/components/RaderChart'
import type { RadarDataPoint } from '@/featured/result/types'

interface RadarChartSectionProps {
  data: RadarDataPoint[]
}

const CHART_SIZE = 320
const CHART_INNER_PADDING = 65
const LABEL_EXTRA_RADIUS = 30
const HOVER_CLOSE_DELAY_MS = 150

const TOOLTIP_BG = '#F2F2F2'
const TOOLTIP_BORDER_COLOR = '#E0E0E0'
const TOOLTIP_TEXT_COLOR = '#555555'

// 0: 상단 → top, 1: 우상단 → right, 2: 우하단 → right, 3: 좌하단 → left, 4: 좌상단 → left
const TOOLTIP_SIDES = ['top', 'right', 'right', 'left', 'left'] as const
// top(0): 아래로 당김, right(1,2): 왼쪽으로 당김, left(3,4): 유지
const TOOLTIP_SIDE_OFFSETS = [13, 20, 20, 8, 8] as const

const CARD_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.16, duration: 0.4, ease: 'easeOut' as const },
  },
}

function getLabelPositions(count: number) {
  const center = CHART_SIZE / 2
  const radius = CHART_SIZE / 2 - CHART_INNER_PADDING
  const labelRadius = radius + LABEL_EXTRA_RADIUS
  const angleStep = (2 * Math.PI) / count

  return Array.from({ length: count }, (_, i) => {
    const angle = angleStep * i - Math.PI / 2
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    }
  })
}

export function RadarChartSection({ data }: RadarChartSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const labelPositions = getLabelPositions(data.length)

  const handleEnter = (i: number) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setHoveredIndex(i)
  }
  const handleLeave = () => {
    closeTimerRef.current = setTimeout(() => setHoveredIndex(null), HOVER_CLOSE_DELAY_MS)
  }

  const handleChartHoverChange = (i: number | null) => {
    if (i !== null) handleEnter(i)
    else handleLeave()
  }

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
          <TooltipProvider>
            {/* 차트 + 라벨 오버레이 */}
            <div className="relative" style={{ width: CHART_SIZE, height: CHART_SIZE }}>
              <RadarChart
                data={data}
                size={CHART_SIZE}
                hoveredIndex={hoveredIndex}
                onHoverChange={handleChartHoverChange}
              />

              {data.map((d, i) => {
                const { x, y } = labelPositions[i]
                const isHovered = hoveredIndex === i
                return (
                  <Tooltip key={d.label} open={isHovered}>
                    <TooltipTrigger asChild>
                      <span
                        className="absolute -translate-x-1/2 -translate-y-1/2 cursor-default whitespace-nowrap transition-all duration-150"
                        style={{ left: x, top: y }}
                        onMouseEnter={() => handleEnter(i)}
                        onMouseLeave={handleLeave}
                      >
                        <span className="relative inline-flex items-center">
                          {/* bold 텍스트로 너비 예약 → hover 시 레이아웃 변화 방지 */}
                          <span className="relative">
                            <span className="invisible text-xs font-bold">{d.label}</span>
                            <span
                              className="text-muted-foreground absolute inset-0 text-xs transition-all duration-150"
                              style={{ fontWeight: isHovered ? 700 : 400 }}
                            >
                              {d.label}
                            </span>
                          </span>
                          <Info
                            className="text-muted-foreground/60 absolute"
                            style={{ width: 10, height: 10, top: -7, right: -13 }}
                          />
                        </span>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent
                      side={TOOLTIP_SIDES[i]}
                      sideOffset={TOOLTIP_SIDE_OFFSETS[i]}
                      className="w-58 border text-wrap"
                      style={{
                        backgroundColor: TOOLTIP_BG,
                        borderColor: TOOLTIP_BORDER_COLOR,
                        color: TOOLTIP_TEXT_COLOR,
                      }}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={handleLeave}
                    >
                      <p className="leading-relaxed break-keep">{d.description}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </TooltipProvider>

          {/* 역량 점수 그리드 */}
          <div className="mt-4 flex w-full gap-2">
            {data.map((d) => (
              <div
                key={d.label}
                className="bg-muted/50 flex flex-1 flex-col items-center rounded-lg px-2 py-2"
              >
                <span className="text-muted-foreground text-center text-xs">{d.label}</span>
                <span className="mt-1 text-sm font-semibold">{d.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
