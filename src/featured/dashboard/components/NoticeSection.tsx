'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react' // ★ 새로 추가됨!

// 1. 방금 우리가 만든 배달부(서비스 함수)와 이름표(타입)를 불러옵니다!
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

// ❌ 가짜 데이터(noticeData)는 이제 지워버렸습니다! ❌

export function NoticeSection() {
  // 2. 서버에서 가져온 진짜 공지사항을 담아둘 "빈 상자(state)"를 만듭니다.
  const [notices, setNotices] = useState<Notice[]>([])

  // 3. 화면이 맨 처음 켜졌을 때(mount), 배달부를 시켜서 데이터를 가져오게 합니다.
  useEffect(() => {
    async function fetchNotices() {
      // 배달부야, 데이터 가져와!
      const result = await getNotices()

      // 우리가 배웠던 마법의 if문 등장! "가져오기 성공했어?"
      if (result.success) {
        // 성공했으면 진짜 데이터(result.data)를 상자(notices)에 넣어줘!
        setNotices(result.data)
      } else {
        // 실패했으면 에러 메시지를 띄워줘!
        console.error('공지사항 불러오기 실패:', result.message)
      }
    }

    // 위에서 만든 심부름 함수를 실행!
    fetchNotices()
  }, []) // 빈 배열([])을 넣으면 "화면 켜질 때 딱 한 번만 실행해!" 라는 뜻입니다.

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
          {/* 4. 가짜 배열(noticeData) 대신, 진짜 상자(notices)를 돌립니다! */}
          {notices.length > 0 ? (
            notices.map((item) => (
              <Link
                key={item.id}
                href={`/notices/${item.id}`}
                className="flex flex-1 flex-col justify-center"
              >
                <div className="hover:bg-muted/40 flex h-full w-full items-center justify-between gap-4 px-5 transition-colors">
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    {/* 명세서에는 카테고리가 없었으므로 일단 '공지'로 고정해 둡니다. */}
                    <span className="flex h-5 w-14 shrink-0 items-center justify-center rounded bg-slate-100 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      공지
                    </span>

                    <div className="flex min-w-0 items-center gap-1.5">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                    </div>
                  </div>

                  {/* 날짜 형식도 명세서에 있던 item.createdAt으로 변경! */}
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {/* 서버가 주는 날짜가 길면 (예: 2026-03-01T09:00:00) 앞의 날짜만 자르기 */}
                    {item.createdAt.split('T')[0]}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            // 데이터가 아직 안 왔거나 없을 때 보여줄 화면
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              공지사항을 불러오는 중입니다...
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
