'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Calendar, Clock, ChevronRight, FileText, Plus } from 'lucide-react'
import { ScoreTrend } from '@/featured/history/components/ScoreTrend'
import type { InterviewRecord } from '@/featured/history/types'

interface HistoryListProps {
  records: InterviewRecord[]
  search: string
  onSelect: (record: InterviewRecord) => void
}

export function HistoryList({ records, search, onSelect }: HistoryListProps) {
  if (records.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center">
        <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <FileText className="text-muted-foreground h-7 w-7" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">기록이 없습니다</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          {search
            ? '검색 결과가 없습니다. 다른 키워드로 검색해보세요.'
            : '아직 면접 연습 기록이 없습니다. 첫 면접을 시작해보세요!'}
        </p>
        {!search && (
          <Button className="gap-2" asChild>
            <Link href="/upload">
              <Plus className="h-4 w-4" />첫 면접 시작하기
            </Link>
          </Button>
        )}
      </motion.div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {records.map((record, i) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="group border-border/50 hover:border-primary/30 hover:shadow-primary/5 cursor-pointer transition-all hover:shadow-md"
              onClick={() => onSelect(record)}
            >
              <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold">{record.position}</h3>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      {record.questionCount}문항
                    </Badge>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {record.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {record.duration}
                    </span>
                  </div>
                </div>
                <ChevronRight className="text-muted-foreground h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" disabled>
          이전
        </Button>
        <Button variant="default" size="sm" className="h-8 w-8 p-0">
          1
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
          2
        </Button>
        <Button variant="outline" size="sm">
          다음
        </Button>
      </div>
    </>
  )
}
