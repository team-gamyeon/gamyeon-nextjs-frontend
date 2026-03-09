import { AlertCircle, Calendar, Clock, TrendingUp } from 'lucide-react'
import { InterviewRecord } from '@/featured/history/types'
import { JSX } from 'react'

interface CompletedCardProps {
  record: InterviewRecord
}

function CompletedCardFront({ record }: CompletedCardProps) {
  return (
    <div>
      <div className="relative bg-linear-to-tr/srgb from-indigo-500 to-teal-400 p-6 text-white">
        <div className="mt-8">
          <div className="mb-2 flex items-end gap-2">
            <span className="text-5xl font-bold">{record.score}</span>
            <span className="mb-2 text-2xl opacity-90">점</span>
          </div>
          {record.prevScore !== null && record.score !== null && (
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>
                이전보다{' '}
                <span className="font-semibold">
                  {record.score - record.prevScore > 0 ? '+' : ''}
                  {record.score - record.prevScore}점
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between px-6 py-8">
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 text-lg font-bold text-gray-900">{record.position}</h3>
            <h3 className="text-xs">{record.questionCount}개 질문</h3>
          </div>
          <div className="space-y-2 py-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>{record.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>{record.duration}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CompletedCardBack({ record }: CompletedCardProps) {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-4 text-center">
        <h3 className="text-lg font-bold text-gray-900">AI 피드백</h3>
      </div>
      <div className="flex-1 space-y-4 py-3">
        <div className="rounded-lg bg-green-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-full bg-green-500 p-1">
              <TrendingUp className="h-3 w-3 text-white" />
            </div>
            <p className="text-sm font-semibold text-green-900">강점</p>
          </div>
          <ul className="space-y-1.5 text-sm text-green-800">
            {record.strengths.length > 0 ? (
              record.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-green-600" />
                  <span>{strength}</span>
                </li>
              ))
            ) : (
              <li className="text-green-700/70">분석된 강점이 없습니다</li>
            )}
          </ul>
        </div>
        <div className="rounded-lg bg-orange-50 p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-full bg-orange-500 p-1">
              <AlertCircle className="h-3 w-3 text-white" />
            </div>
            <p className="text-sm font-semibold text-orange-900">개선점</p>
          </div>
          <ul className="space-y-1.5 text-sm text-orange-800">
            {record.improvements.length > 0 ? (
              record.improvements.map((improvement, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-orange-600" />
                  <span>{improvement}</span>
                </li>
              ))
            ) : (
              <li className="text-orange-700/70">개선점이 발견되지 않았습니다</li>
            )}
          </ul>
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-gray-500">클릭하여 자세히 보기</div>
    </div>
  )
}
export { CompletedCardFront, CompletedCardBack }
