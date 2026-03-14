'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getNoticesAction } from '@/featured/notice/actions/notice.action'
import type { Notice } from '@/featured/notice/types'
import { NOTICE_CATEGORY } from '@/featured/notice/constants'
import { formatDateDot, checkIsRecent } from '@/shared/lib/utils/date'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}


type NoticeWithUI = Notice & { isRecent: boolean }

export function NoticeSection() {
  const [notices, setNotices] = useState<NoticeWithUI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchNotices() {
      setIsLoading(true)
      try {
        const result = await getNoticesAction()

        if (result.success && result.data) {
          const processedNotices = result.data.map((item) => ({
            ...item,
            isRecent: checkIsRecent(item.createdAt),
          }))
          setNotices(processedNotices)
        } else {
          console.error('공지사항 불러오기 실패:', result.message)
          setNotices([])
        }

//         ⬇️ Suggested change
// -          const processedNotices = result.data.map((item) => ({
// +const processedNotices = result.data.slice(0, 5).map((item) => ({
// +  ...item,
// +  isRecent: checkIsRecent(item.createdAt),
// +}))
// 이런 느낌으로 대시보드에서 보여지는 갯수 만큼 정해놓는게 좋을것 같아요
      } catch (error) {
        console.error('공지사항 통신 에러 발생:', error)
        setNotices([])
      } finally {
        setIsLoading(false)
      }
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
              const config = NOTICE_CATEGORY[item.category] || NOTICE_CATEGORY.NOTICE

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

                        {item.isRecent && (
                          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                            N
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-muted-foreground shrink-0 text-xs">
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
