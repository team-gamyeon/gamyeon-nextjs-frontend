'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getNotices } from '../services/dashboardService'
import type { Notice } from '../types'

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

  useEffect(() => {
    async function fetchNotices() {
      const result = await getNotices()

      if (result.success) {
        setNotices(result.data)
      } else {
        console.error('공지사항 불러오기 실패:', result.message)
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
          {notices.length > 0 ? (
            notices.map((item) => (
              <Link
                key={item.id}
                href={`/notices/${item.id}`}
                className="flex flex-1 flex-col justify-center"
              >
                <div className="hover:bg-muted/40 flex h-full w-full items-center justify-between gap-4 px-5 transition-colors">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    {/* 명세서에 카테고리가 없었으므로 일단 '공지'로 고정해 둡니다. */}
                    <span className="flex h-5 w-14 shrink-0 items-center justify-center rounded bg-slate-100 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      공지
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
            ))
          ) : (
            // 공지사항이 없거나 아직 불러오지 못한 경우 보여줄 UI??
            // 없을때랑 불러오지 못한 경우랑 ui 달라져야하는거아님?
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              공지사항을 불러오는 중입니다...
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
