'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/shared/ui/card'
import type { Notice } from '@/featured/notice/types'

// [수정 포인트 1] 예전 가짜 색상표 지우고, 우리가 만든 진짜 사전(constants)을 가져옵니다.
import { NOTICE_CATEGORY } from '@/featured/notice/constants'
// [수정 포인트 2] 서버가 준 날짜 모양을 예쁘게 깎아줄 도구를 가져옵니다.
import { formatDateDot } from '@/shared/lib/utils/date'

interface NoticeListProps {
  notices: Notice[]
  search: string
}

// [수정 포인트 3] 서버는 '새 글'인지 안 알려줍니다. 우리가 날짜를 보고 직접 판단하는 계산기를 만듭니다.
const checkIsRecent = (dateString: string) => {
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000 // 3일 치 시간
  return new Date(dateString).getTime() > Date.now() - THREE_DAYS_MS
}

export function NoticeList({ notices, search }: NoticeListProps) {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()

  // 데이터가 없을 때 빈 화면 보여주는 부분 (수정할 필요 없이 완벽합니다!)
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
    <Card className="border-border/50 overflow-hidden py-4">
      <CardContent className="p-0">
        <AnimatePresence initial={false}>
          {notices.map((notice, i) => {
            // [핵심 변경] 화면을 그리기 전에, 여기서 영어(notice.category)를 한글과 색상으로 번역합니다.
            const config = NOTICE_CATEGORY[notice.category] || NOTICE_CATEGORY.NOTICE
            // 이 글이 최근 3일 안에 써진 건지 검사합니다.
            const isRecent = checkIsRecent(notice.createdAt)

            return (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={
                  shouldReduceMotion ? { duration: 0 } : { delay: i * 0.02, duration: 0.15 }
                }
                whileTap={
                  shouldReduceMotion ? {} : { opacity: 0.6, transition: { duration: 0.05 } }
                }
                // 클릭하면 그 공지사항의 상세 페이지로 이동!
                onClick={() => router.push(`/notices/${notice.id}`)}
                className="border-border/40 hover:bg-muted/40 flex cursor-pointer items-center justify-between gap-4 border-b px-6 py-4 transition-colors last:border-b-0"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* 번역기(config)에서 색상(color)과 한글 이름(label)을 쏙 빼서 씁니다 */}
                  <span
                    className={`flex h-5 w-14 shrink-0 items-center justify-center rounded text-[10px] font-medium ${config.color}`}
                  >
                    {config.label}
                  </span>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p className="truncate text-sm font-medium">{notice.title}</p>
                    {/* isRecent가 진짜(true)일 때만 빨간색 N 마크를 띄워줍니다 */}
                    {isRecent ? (
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                        N
                      </span>
                    ) : null}
                  </div>
                </div>
                {/* 예전의 가짜 date 대신, 진짜 createdAt을 넣고 예쁘게 깎아줍니다. */}
                <span className="text-muted-foreground shrink-0 text-xs">
                  {formatDateDot(new Date(notice.createdAt))}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
