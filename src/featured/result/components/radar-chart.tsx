'use client'

import { motion } from 'framer-motion'

interface RadarChartProps {
  data: { label: string; value: number; description: string }[]
  size?: number
  hoveredIndex: number | null
  onHoverChange: (index: number | null) => void
}

export function RadarChart({ data, size = 320, hoveredIndex, onHoverChange }: RadarChartProps) {
  const center = size / 2
  const radius = size / 2 - 65
  const levels = 5
  const angleStep = (2 * Math.PI) / data.length

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2
    return {
      x: center + radius * (value / 100) * Math.cos(angle),
      y: center + radius * (value / 100) * Math.sin(angle),
    }
  }

  const dataPoints = data.map((d, i) => getPoint(i, d.value))
  const pathData = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

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
          fill={hoveredIndex === i ? 'oklch(0.6 0 0)' : 'oklch(0.546 0.245 262.881)'}
          stroke="white"
          strokeWidth={2}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1 }}
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => onHoverChange(i)}
          onMouseLeave={() => onHoverChange(null)}
        />
      ))}
    </svg>
  )
}
