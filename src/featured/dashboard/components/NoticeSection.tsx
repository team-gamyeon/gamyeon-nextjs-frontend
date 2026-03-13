'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getNoticesAction } from '../actions/dashboard.action'
import type { Notice } from '@/featured/notice/types'
import { NOTICE_CATEGORY_CONFIG } from '@/featured/notice/constants'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

export function NoticeSection() {
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [now, setNow] = useState<number>(0)

  useEffect(() => {
    async function fetchNotices() {
      setIsLoading(true)

      // 웨이터가 주방(서버)에 다녀옵니다. (여기서 약간의 시간이 걸림)
      const result = await getNoticesAction()

      // [수정된 부분] 데이터가 도착한 직후에 시계를 보고 메모(now)합니다!
      // 이렇게 서버 통신(비동기) 이후에 상태를 바꾸면, 리액트가 숨을 고를 수 있어서 에러가 안 납니다.
      setNow(Date.now())

      if (result.success && result.data) {
        setNotices(result.data)
      } else {
        console.error('공지사항 불러오기 실패:', result.message)
        setNotices([])
      }
      setIsLoading(false)
    }

    fetchNotices()
  }, []) // 맨 위에 있던 setNow(Date.now())는 삭제했습니다!

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
              const config = NOTICE_CATEGORY_CONFIG[item.category] || NOTICE_CATEGORY_CONFIG.NOTICE

              // 여기서 메모해둔 now 값을 씁니다.
              const isRecent =
                now > 0 && new Date(item.createdAt).getTime() > now - 3 * 24 * 60 * 60 * 1000

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

                        {isRecent && (
                          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                            N
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-muted-foreground shrink-0 text-xs">
                      {item.createdAt.split('T')[0]}
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
