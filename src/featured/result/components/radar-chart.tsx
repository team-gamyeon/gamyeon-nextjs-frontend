'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface RadarChartProps {
  data: { label: string; value: number }[]
  size?: number
}

export function RadarChart({ data, size = 320 }: RadarChartProps) {
  const center = size / 2
  const radius = size / 2 - 65
  const levels = 5
  const angleStep = (2 * Math.PI) / data.length
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2
    return {
      x: center + radius * (value / 100) * Math.cos(angle),
      y: center + radius * (value / 100) * Math.sin(angle),
    }
  }

  const dataPoints = data.map((d, i) => getPoint(i, d.value))
  const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

  const getTooltipPosition = (p: { x: number; y: number }) => {
    const tooltipWidth = 90
    const tooltipHeight = 36
    const padding = 8
    let tx = p.x - tooltipWidth / 2
    let ty = p.y - tooltipHeight - padding

    if (tx < 4) tx = 4
    if (tx + tooltipWidth > size - 4) tx = size - tooltipWidth - 4
    if (ty < 4) ty = p.y + padding

    return { tx, ty, tooltipWidth, tooltipHeight }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid */}
      {Array.from({ length: levels }).map((_, level) => {
        const levelRadius = (radius * (level + 1)) / levels
        const points = data
          .map((_, i) => {
            const angle = angleStep * i - Math.PI / 2
            return `${center + levelRadius * Math.cos(angle)},${center + levelRadius * Math.sin(angle)}`
          })
          .join(' ')
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-border"
          />
        )
      })}

      {/* Axes */}
      {data.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="currentColor"
            strokeWidth={0.5}
            className="text-border"
          />
        )
      })}

      {/* Data area */}
      <motion.path
        d={pathData}
        fill="oklch(0.546 0.245 262.881 / 0.15)"
        stroke="oklch(0.546 0.245 262.881)"
        strokeWidth={2}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{ transformOrigin: `${center}px ${center}px` }}
      />

      {/* Data points */}
      {dataPoints.map((p, i) => (
        <motion.circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={hoveredIndex === i ? 6 : 4}
          fill="oklch(0.546 0.245 262.881)"
          stroke="white"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1 }}
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        />
      ))}

      {/* Labels */}
      {data.map((d, i) => {
        const angle = angleStep * i - Math.PI / 2
        const labelRadius = radius + 30
        const x = center + labelRadius * Math.cos(angle)
        const y = center + labelRadius * Math.sin(angle)
        const parts = d.label.split(' ')
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={11}
            className="fill-muted-foreground"
          >
            {parts.length > 1 ? (
              <>
                <tspan x={x} dy="-7">{parts[0]}</tspan>
                <tspan x={x} dy="14">{parts[1]}</tspan>
              </>
            ) : (
              d.label
            )}
          </text>
        )
      })}

      {/* Tooltip */}
      {hoveredIndex !== null && (() => {
        const p = dataPoints[hoveredIndex]
        const d = data[hoveredIndex]
        const { tx, ty, tooltipWidth, tooltipHeight } = getTooltipPosition(p)
        return (
          <g pointerEvents="none">
            <rect
              x={tx}
              y={ty}
              width={tooltipWidth}
              height={tooltipHeight}
              rx={6}
              ry={6}
              fill="oklch(0.2 0.02 262)"
              opacity={0.92}
            />
            <text
              x={tx + tooltipWidth / 2}
              y={ty + 13}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={10}
              fontWeight={500}
            >
              {d.label}
            </text>
            <text
              x={tx + tooltipWidth / 2}
              y={ty + 26}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="oklch(0.75 0.18 262.881)"
              fontSize={11}
              fontWeight={700}
            >
              {d.value}점
            </text>
          </g>
        )
      })()}
    </svg>
  )
}
