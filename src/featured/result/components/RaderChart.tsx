'use client'

import { useEffect, useRef } from 'react'
import {
  RadarChart as RechartsRadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
} from 'recharts'
import type { RadarDataPoint } from '@/featured/result/types'

const OUTER_RADIUS = 150
const LABEL_RADIUS = 180
const INNER_LABEL_RADIUS = 170
const INNER_LABEL_INDICES = new Set([0, 2, 3]) // 답변 구성력, 키워드, 논리성

interface RadarChartProps {
  data: RadarDataPoint[]
  size?: number
}


const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: { value: number }[]
}) => {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-lg border px-3 py-2 text-sm font-semibold whitespace-nowrap shadow-sm"
      style={{ backgroundColor: '#F2F2F2', borderColor: '#E0E0E0', color: '#333' }}
    >
      {payload[0].value}점
    </div>
  )
}

export function RadarChart({ data, size = 320 }: RadarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cx = size / 2
  const cy = size / 2

  // 마운트 시 중앙 좌표로 tooltip prevCoordinate 초기화 → 첫 hover 시 중앙에서 시작
  useEffect(() => {
    const timer = setTimeout(() => {
      const svg = containerRef.current?.querySelector('svg')
      if (!svg) return
      const rect = svg.getBoundingClientRect()
      svg.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: rect.left + cx, clientY: rect.top + cy }))
      svg.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
    }, 0)
    return () => clearTimeout(timer)
  }, [cx, cy])

  // 라벨 hover → 해당 dot 좌표로 synthetic mousemove dispatch → Recharts tooltip 트리거
  const triggerTooltip = (index: number) => {
    const item = data[index]
    const angleStep = (2 * Math.PI) / data.length
    const angle = angleStep * index - Math.PI / 2
    const dotR = OUTER_RADIUS * (item.value / 100)
    const dotX = cx + dotR * Math.cos(angle)
    const dotY = cy + dotR * Math.sin(angle)

    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    svg.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: rect.left + dotX,
        clientY: rect.top + dotY,
      }),
    )
  }

  const hideTooltip = () => {
    const svg = containerRef.current?.querySelector('svg')
    if (!svg) return
    svg.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
  }

  return (
    <div
      ref={containerRef}
      className="relative [&_.recharts-surface]:overflow-visible"
      style={{ width: size, height: size, overflow: 'visible' }}
    >
      <RechartsRadarChart
        width={size}
        height={size}
        data={data}
        cx="50%"
        cy="50%"
        outerRadius={OUTER_RADIUS}
      >
        <PolarGrid
          gridType="polygon"
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={0.5}
        />
        <PolarAngleAxis dataKey="label" tick={false} />
        <PolarRadiusAxis domain={[0, 100]} tickCount={6} tick={false} axisLine={false} />
        <Tooltip
          content={CustomTooltip as never}
          cursor={false}
          isAnimationActive={false}
          wrapperStyle={{ transition: 'left 350ms ease, top 350ms ease' }}
        />
        <Radar
          dataKey="value"
          fill="oklch(0.546 0.245 262.881)"
          fillOpacity={0.15}
          stroke="oklch(0.546 0.245 262.881)"
          strokeWidth={2}
          dot={{
            r: 4,
            fill: 'oklch(0.546 0.245 262.881)',
            fillOpacity: 0.8,
            stroke: 'white',
            strokeWidth: 2,
          }}
          activeDot={{
            r: 6,
            fill: 'oklch(0.546 0.245 262.881)',
            fillOpacity: 1,
            stroke: 'white',
            strokeWidth: 2.5,
          }}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </RechartsRadarChart>

      {/* 라벨 오버레이 */}
      {data.map((item, index) => {
        const angleStep = (2 * Math.PI) / data.length
        const angle = angleStep * index - Math.PI / 2
        const radius = INNER_LABEL_INDICES.has(index) ? INNER_LABEL_RADIUS : LABEL_RADIUS
        const x = cx + radius * Math.cos(angle)
        const y = cy + radius * Math.sin(angle)

        return (
          <span
            key={index}
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-default text-[11px] text-current opacity-60 transition-all duration-150 select-none hover:font-semibold hover:opacity-90"
            style={{ left: x, top: y }}
            onMouseEnter={() => triggerTooltip(index)}
            onMouseLeave={hideTooltip}
          >
            {item.label}
          </span>
        )
      })}
    </div>
  )
}
