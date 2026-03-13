'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'

// ✅ 1. 웨이터(Action) 불러오기
import { getNoticesAction } from '../actions/dashboard.action'

// ✅ 2. 공지사항 공식 타입과 설정(색상/라벨) 불러오기
// (주의: @/featured/notice/... 경로는 실제 프로젝트 폴더 구조에 맞게 수정해 주세요)
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

  // 🗑️ isError 상태 제거

  useEffect(() => {
    async function fetchNotices() {
      setIsLoading(true)

      const result = await getNoticesAction()

      // result.data가 null일 경우를 대비해 기본값 빈 배열([]) 설정
      if (result.success && result.data) {
        setNotices(result.data)
      } else {
        // 에러가 나거나 데이터가 없으면 빈 배열로 조용히 처리
        console.error('공지사항 불러오기 실패:', result.message)
        setNotices([])
      }
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
              const config = NOTICE_CATEGORY_CONFIG[item.category] || NOTICE_CATEGORY_CONFIG.NOTICE

              // 작성일 기준 3일(72시간) 이내면 새 글로 취급하는 로직
              const isRecent =
                new Date(item.createdAt).getTime() > Date.now() - 3 * 24 * 60 * 60 * 1000

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
            // 데이터가 없거나 에러가 났을 때 공통으로 보여줄 UI
            <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
              새로운 공지사항이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
