import { AlertTriangle, Calendar, Clock } from 'lucide-react'
import { InterviewRecord } from '@/featured/history/types'

interface FailedCardProps {
  record: InterviewRecord
}

export function FailedCard({ record }: FailedCardProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="bg-gradient-to-br from-red-500 to-red-600 p-2 pb-5 text-white @[180px]:p-3 @[180px]:pb-6 @[220px]:p-4 @[220px]:pb-8 @[280px]:p-6 @[280px]:pb-10">
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-white/20 p-2 @[180px]:p-2.5 @[220px]:p-3 @[280px]:p-4">
            <AlertTriangle className="h-6 w-6 @[180px]:h-8 @[180px]:w-8 @[220px]:h-10 @[220px]:w-10 @[280px]:h-12 @[280px]:w-12" />
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden px-2 py-2 @[180px]:px-3 @[180px]:py-3 @[220px]:px-4 @[220px]:py-4 @[280px]:px-6 @[280px]:py-6">
        <div className="space-y-1 @[180px]:space-y-1.5 @[220px]:space-y-2 @[280px]:space-y-3">
          <div>
            <h3 className="mb-0.5 truncate text-[11px] font-bold text-gray-900 @[180px]:text-xs @[220px]:text-sm @[280px]:mb-1 @[280px]:text-base">
              {record.position}
            </h3>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-gray-600 @[180px]:gap-1.5 @[180px]:text-[11px] @[220px]:gap-2 @[220px]:text-xs @[280px]:text-sm">
            <Calendar className="h-2.5 w-2.5 shrink-0 text-blue-500 @[180px]:h-3 @[180px]:w-3 @[220px]:h-3.5 @[220px]:w-3.5 @[280px]:h-4 @[280px]:w-4" />
            <span className="truncate">{record.date}</span>
          </div>

          <div className="rounded-md bg-red-50 p-1.5 @[180px]:p-2 @[220px]:rounded-lg @[220px]:p-2.5 @[280px]:p-3">
            <p className="mb-0.5 text-[10px] font-semibold leading-tight text-red-900 @[220px]:text-xs @[280px]:text-sm">
              리포트 발행 실패
            </p>
            <p className="line-clamp-2 text-[9px] leading-tight text-red-700 @[220px]:text-[10px] @[280px]:text-xs">
              면접 데이터 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
