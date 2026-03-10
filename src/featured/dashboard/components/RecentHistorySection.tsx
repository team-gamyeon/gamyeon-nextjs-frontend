'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { ChevronRight, Inbox } from 'lucide-react'
import type { RecentHistoryItem } from '@/featured/dashboard/types'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

const mockRecentHistory: RecentHistoryItem[] = [
  { id: 1, position: '프론트엔드 개발자', score: 76, date: '2026.02.25', diff: +8 },
  { id: 2, position: '프론트엔드 개발자', score: 68, date: '2026.02.22', diff: +3 },
  { id: 3, position: '백엔드 개발자', score: 65, date: '2026.02.18', diff: null },
]

export interface RecentHistorySectionProps {
  history?: RecentHistoryItem[]
}

export function RecentHistorySection({ history = mockRecentHistory }: RecentHistorySectionProps) {
  const isEmpty = history.length === 0
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      custom={4}
      className="flex h-full flex-col"
    >
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          최근 면접 기록
        </h2>
        {!isEmpty && (
          <Link
            href="/history"
            className="text-primary flex items-center gap-1 text-xs hover:underline"
          >
            전체 보기 <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <Card className="border-border/50 flex h-67 flex-col overflow-hidden">
        <CardContent
          className={
            isEmpty
              ? 'flex flex-1 flex-col items-center justify-center p-5'
              : 'flex flex-1 flex-col p-0 py-6'
          }
        >
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="bg-muted/30 flex h-12 w-12 items-center justify-center rounded-full">
                <Inbox className="text-muted-foreground h-6 w-6" />
              </div>
              <p className="text-muted-foreground text-sm">진행된 면접 기록이 없습니다.</p>
            </div>
          ) : (
            history.map((item, i) => (
              <Link
                key={i}
                href={`/result/${item.id}`}
                className="flex flex-1 flex-col justify-center"
              >
                <div className="hover:bg-muted/40 flex h-full w-full items-center gap-4 px-5 transition-colors">
                  <div
                    className={`flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-sm font-bold ${
                      item.score >= 80
                        ? 'bg-green-50 text-green-700'
                        : item.score >= 70
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {item.score}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.position}</p>
                    <p className="text-muted-foreground text-xs">{item.date}</p>
                  </div>
                  {item.diff !== null ? (
                    <span
                      className={`text-xs font-medium ${item.diff > 0 ? 'text-green-600' : 'text-red-500'}`}
                    >
                      {item.diff > 0 ? '+' : ''}
                      {item.diff}점
                    </span>
                  ) : null}
                  <ChevronRight className="text-muted-foreground h-4 w-4" />
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
