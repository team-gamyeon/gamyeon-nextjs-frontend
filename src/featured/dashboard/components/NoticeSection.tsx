'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getNoticesAction } from '../actions/dashboard.action'
import type { Notice } from '@/featured/notice/types'
import { NOTICE_CATEGORY_CONFIG } from '@/featured/notice/constants'
import { formatDateDot } from '@/shared/lib/utils/date' // 🍯 날짜 포맷 꿀팁!

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

// ✅ 1. 로직 분리: 새 글(72시간 이내)인지 확인하는 함수를 밖으로 뺐습니다.
const checkIsRecent = (dateString: string) => {
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000
  return new Date(dateString).getTime() > Date.now() - THREE_DAYS_MS
}

// ✅ 2. UI 전용 타입: 기존 Notice 데이터에 프론트엔드에서 계산한 isRecent를 살짝 얹어줍니다.
type NoticeWithUI = Notice & { isRecent: boolean }

export function NoticeSection() {
  // state가 NoticeWithUI를 담도록 변경, now state는 완전히 삭제!
  const [notices, setNotices] = useState<NoticeWithUI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchNotices() {
      setIsLoading(true)

      // 웨이터(Action) 호출 (Action 안에 이미 try/catch가 있으므로 여기선 생략)
      const result = await getNoticesAction()

      if (result.success && result.data) {
        // ✅ 3. 데이터 가공: 화면을 그리기 전에 미리 '새 글' 여부를 계산해서 데이터에 붙여버립니다.
        const processedNotices = result.data.map((item) => ({
          ...item,
          isRecent: checkIsRecent(item.createdAt),
        }))
        setNotices(processedNotices)
      } else {
        console.error('공지사항 불러오기 실패:', result.message)
        setNotices([])
      }

      // ✅ finally 역할을 하는 로직
      setIsLoading(false)
    }

    fetchNotices()
  }, [])

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      custom={5}
      className="flex h-full flex-col"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          공지사항
        </h2>
        <Link
          href="/notices"
          className="text-primary flex items-center gap-1 text-xs hover:underline"
        >
          전체 보기 <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <Card className="border-border/50 flex h-full flex-col overflow-hidden py-4">
        <CardContent className="flex flex-1 flex-col p-0">
          {isLoading ? (
            <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
              공지사항을 불러오는 중입니다...
            </div>
          ) : notices.length > 0 ? (
            notices.map((item) => {
              // ✅ 4. map 내부 가독성 개선: 계산 로직이 다 빠지고 UI 그리는 것에만 집중합니다!
              const config = NOTICE_CATEGORY_CONFIG[item.category] || NOTICE_CATEGORY_CONFIG.NOTICE

              return (
                <Link
                  key={item.id}
                  href={`/notices/${item.id}`}
                  className="flex flex-1 flex-col justify-center"
                >
                  <div className="hover:bg-muted/40 flex h-full w-full items-center justify-between gap-4 px-5 transition-colors">
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      <span
                        className={`flex h-5 w-14 shrink-0 items-center justify-center rounded text-[10px] font-medium ${config.color}`}
                      >
                        {config.label}
                      </span>

                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="truncate text-sm font-medium">{item.title}</p>

                        {/* 아까 가공해둔 isRecent를 꺼내서 쓰기만 하면 끝! */}
                        {item.isRecent && (
                          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                            N
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-muted-foreground shrink-0 text-xs">
                      {/* 🍯 아까 말씀드린 예쁜 날짜 포맷 적용 */}
                      {formatDateDot(new Date(item.createdAt))}
                    </span>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
              새로운 공지사항이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
