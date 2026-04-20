'use client'

import { AlertCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

interface StrengthsWeaknessesSectionProps {
  strengths: string[]
  weaknesses: string[]
}

export function StrengthsWeaknessesSection({
  strengths,
  weaknesses,
}: StrengthsWeaknessesSectionProps) {
  const displayStrengths = strengths.slice(0, 3)
  const displayWeaknesses = weaknesses.slice(0, 3)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:col-span-3">
      {/* 잘한 점 카드 */}
      <Card className="border-green-100 bg-green-50 py-6 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-green-900">
            <div className="rounded-full bg-green-500 p-1">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            잘한 점
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {displayStrengths.map((text, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
              <span className="text-sm leading-relaxed text-green-800">{text}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 개선할 점 카드 */}
      <Card className="border-orange-100 bg-orange-50 py-6 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-orange-900">
            <div className="rounded-full bg-orange-500 p-1">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            개선할 점
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {displayWeaknesses.map((text, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-600" />
              <span className="text-sm leading-relaxed text-orange-800">{text}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
