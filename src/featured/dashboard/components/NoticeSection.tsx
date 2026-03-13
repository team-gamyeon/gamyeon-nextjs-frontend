'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getNotices } from '../services/dashboardService'
import type { Notice, NoticeCategory } from '../types'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

// 📌 카테고리별 한국어 라벨 및 색상 맵핑 객체
const categoryConfig: Record<NoticeCategory, { label: string; color: string }> = {
  NOTICE: { label: '공지', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  UPDATE: {
    label: '업데이트',
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  GUIDE: {
    label: '안내',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  EVENT: {
    label: '이벤트',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  },
  MAINTENANCE: {
    label: '점검',
    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
}

export function NoticeSection() {
  const [notices, setNotices] = useState<Notice[]>([])
  // 📌 로딩 및 에러 상태 추가
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    async function fetchNotices() {
      setIsLoading(true) // 페치 시작 전 로딩 켜기
      setIsError(false)

      const result = await getNotices()

      if (result.success) {
        setNotices(result.data)
      } else {
        console.error('공지사항 불러오기 실패:', result.message)
        setIsError(true) // 실패 시 에러 상태 켜기
      }
      setIsLoading(false) // 페치 완료 후 로딩 끄기
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
          {/* 📌 상태에 따른 조건부 렌더링 */}
          {isLoading ? (
            <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
              공지사항을 불러오는 중입니다...
            </div>
          ) : isError ? (
            <div className="text-destructive flex flex-1 items-center justify-center text-sm">
              공지사항을 불러오지 못했습니다.
            </div>
          ) : notices.length > 0 ? (
            notices.map((item) => {
              // 카테고리 설정 가져오기 (fallback 처리 포함)
              const config = categoryConfig[item.category] || categoryConfig.NOTICE

              return (
                <Link
                  key={item.id}
                  href={`/notices/${item.id}`}
                  className="flex flex-1 flex-col justify-center"
                >
                  <div className="hover:bg-muted/40 flex h-full w-full items-center justify-between gap-4 px-5 transition-colors">
                    <div className="flex min-w-0 flex-1 items-center gap-2.5">
                      {/* 📌 동적 카테고리 뱃지 적용 */}
                      <span
                        className={`flex h-5 w-14 shrink-0 items-center justify-center rounded text-[10px] font-medium ${config.color}`}
                      >
                        {config.label}
                      </span>

                      <div className="flex min-w-0 items-center gap-1.5">
                        <p className="truncate text-sm font-medium">{item.title}</p>
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
              등록된 공지사항이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
