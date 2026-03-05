import { cn } from '@/shared/lib/utils'

interface VuMeterProps {
  level: number
}

const BARS = 22

export function VuMeter({ level }: VuMeterProps) {
  return (
    <div className="bg-muted flex h-9 items-end gap-0.5 rounded-xl px-3 py-2">
      {Array.from({ length: BARS }, (_, i) => {
        const threshold = i / BARS
        const active = level > threshold
        const color =
          threshold < 0.6 ? 'bg-green-500' : threshold < 0.8 ? 'bg-yellow-400' : 'bg-red-500'
        return (
          <div
            key={i}
            className={cn(
              'flex-1 rounded-sm transition-all duration-75',
              active ? color : 'bg-muted-foreground/20',
            )}
            style={{ height: '100%' }}
          />
        )
      })}
    </div>
  )
}
