import { RotateCw } from 'lucide-react'
import { Button } from '@/shared/ui/button'

export function AnalysingCard() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="rounded-full bg-gradient-to-br from-green-100 to-emerald-100 p-6">
        <RotateCw className="h-12 w-12 text-green-600" />
      </div>
      <div>
        <h3 className="mb-2 text-xl font-bold text-gray-900">이어하기</h3>
        <p className="text-sm text-gray-500">중단된 면접을 계속 진행하세요</p>
      </div>
      <Button
        className="gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <RotateCw className="h-4 w-4" />
        면접 재개하기
      </Button>
    </div>
  )
}
