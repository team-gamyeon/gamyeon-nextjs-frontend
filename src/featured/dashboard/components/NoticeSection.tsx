'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/shared/ui/card'
import { ChevronRight } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
}

const noticeData = [
  {
    id: 1,
    category: '업데이트',
    title: '프론트엔드 직무 모의 면접 질문 세트가 추가되었습니다.',
    date: '2026.03.08',
    isNew: true,
  },
  {
    id: 2,
    category: '안내',
    title: '보다 안정적인 서비스를 위한 서버 정기 점검 안내 (3/10)',
    date: '2026.03.05',
    isNew: false,
  },
  {
    id: 3,
    category: '이벤트',
    title: '2026년 상반기 공채 대비 AI 면접 무제한 패스!',
    date: '2026.03.01',
    isNew: false,
  },
  {
    id: 4,
    category: '공지사항',
    title: 'AI 면접관 음성 인식 속도 및 정확도 대폭 개선 안내',
    date: '2026.02.26',
    isNew: false,
  },
]

export function NoticeSection() {
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

      <Card className="border-border/50 flex h-full flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col p-0">
          {noticeData.map((item) => (
            <Link
              key={item.id}
              href={`/notices/${item.id}`}
              className="flex flex-1 flex-col justify-center"
            >
              <div className="hover:bg-muted/40 flex h-full w-full items-center justify-between gap-4 px-5 transition-colors">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  {/* 🚨 태그 너비/높이 고정 및 중앙 정렬 적용 (w-[56px] h-5 flex items-center justify-center) */}
                  <span
                    className={`flex h-5 w-14 shrink-0 items-center justify-center rounded text-[10px] font-medium ${
                      item.category === '업데이트'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
                        : item.category === '안내'
                          ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          : item.category === '이벤트'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400'
                    }`}
                  >
                    {item.category}
                  </span>
                  <div className="flex min-w-0 items-center gap-1.5">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    {item.isNew && (
                      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                        N
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-muted-foreground shrink-0 text-xs">{item.date}</span>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )
}
