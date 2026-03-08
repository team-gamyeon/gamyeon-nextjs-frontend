'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/shared/ui/card'
import type { Notice } from '@/featured/notice/types'
import { CATEGORY_COLORS } from '@/featured/notice/types'

interface NoticeListProps {
  notices: Notice[]
  search: string
}

export function NoticeList({ notices, search }: NoticeListProps) {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()

  if (notices.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
        className="py-20 text-center"
      >
        <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
          <Bell className="text-muted-foreground h-7 w-7" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">공지사항이 없습니다</h3>
        <p className="text-muted-foreground text-sm">
          {search
            ? '검색 결과가 없습니다. 다른 키워드로 검색해보세요.'
            : '해당 카테고리의 공지사항이 없습니다.'}
        </p>
      </motion.div>
    )
  }

  return (
    <Card className="border-border/50 overflow-hidden">
      <CardContent className="p-0">
        <AnimatePresence initial={false}>
          {notices.map((notice, i) => (
            <motion.div
              key={notice.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={
                shouldReduceMotion ? { duration: 0 } : { delay: i * 0.02, duration: 0.15 }
              }
              whileTap={shouldReduceMotion ? {} : { opacity: 0.6, transition: { duration: 0.05 } }}
              onClick={() => router.push(`/notices/${notice.id}`)}
              className="border-border/40 hover:bg-muted/40 flex cursor-pointer items-center justify-between gap-4 border-b px-6 py-4 transition-colors last:border-b-0"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className={`flex h-5 w-14 shrink-0 items-center justify-center rounded text-[10px] font-medium ${CATEGORY_COLORS[notice.category]}`}
                >
                  {notice.category}
                </span>
                <div className="flex min-w-0 items-center gap-1.5">
                  <p className="truncate text-sm font-medium">{notice.title}</p>
                  {notice.isNew ? (
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                      N
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs">{notice.date}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
