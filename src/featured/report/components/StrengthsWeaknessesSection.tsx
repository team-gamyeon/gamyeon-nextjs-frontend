'use client'

import { ThumbsUp, TriangleAlert, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

interface StrengthsWeaknessesSectionProps {
  strengths: string[]
  weaknesses: string[]
}

export function StrengthsWeaknessesSection({
  strengths,
  weaknesses,
}: StrengthsWeaknessesSectionProps) {
  // 백엔드 데이터 3줄로 내려줌
  const displayStrengths = strengths.slice(0, 3)
  const displayWeaknesses = weaknesses.slice(0, 3)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:col-span-3">
      {/* 잘한 점 카드 */}
      <Card className="border-green-100 bg-green-50/30 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-green-700">
            <ThumbsUp className="h-5 w-5" />
            잘한 점
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {displayStrengths.map((text, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              <span className="text-sm leading-relaxed text-gray-700">{text}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 개선할 점 카드 */}
      <Card className="border-orange-100 bg-orange-50/30 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-orange-600">
            <TriangleAlert className="h-5 w-5" />
            개선할 점
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {displayWeaknesses.map((text, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />
              <span className="text-sm leading-relaxed text-gray-700">{text}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
