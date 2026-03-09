'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

import type { Notice } from '@/featured/notice/types'
import { CATEGORY_COLORS } from '@/featured/notice/types'

interface NoticeDetailProps {
  notice: Notice
  prevNotice: Notice | null
  nextNotice: Notice | null
}

function NoticeContent({ content }: { content: string }) {
  const paragraphs = content.split('\n\n')

  return (
    <div className="space-y-3 text-sm leading-7">
      {paragraphs.map((paragraph, i) => {
        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
          return (
            <p key={i} className="text-foreground pt-1 font-semibold">
              {paragraph.slice(2, -2)}
            </p>
          )
        }
        if (paragraph.startsWith('- ')) {
          const items = paragraph.split('\n').filter((line) => line.startsWith('- '))
          return (
            <ul key={i} className="text-foreground/75 ml-1 list-none space-y-1.5">
              {items.map((item, j) => (
                <li key={j} className="flex items-start gap-2">
                  <span className="bg-primary/60 mt-2.5 h-1 w-1 shrink-0 rounded-full" />
                  {item.slice(2)}
                </li>
              ))}
            </ul>
          )
        }
        if (paragraph.match(/^\d+\./)) {
          const items = paragraph.split('\n').filter((line) => line.match(/^\d+\./))
          return (
            <ol key={i} className="text-foreground/75 ml-1 list-none space-y-1.5">
              {items.map((item, j) => (
                <li key={j} className="flex items-start gap-2.5">
                  <span className="bg-primary/10 text-primary mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
                    {j + 1}
                  </span>
                  {item.replace(/^\d+\.\s*/, '')}
                </li>
              ))}
            </ol>
          )
        }
        return (
          <p key={i} className="text-foreground/75 whitespace-pre-line">
            {paragraph}
          </p>
        )
      })}
    </div>
  )
}

export function NoticeDetail({ notice, prevNotice, nextNotice }: NoticeDetailProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 28 }
      }
      className="px-8 py-6"
    >
      {/* 상단: 목록으로 + 브레드크럼 */}
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2 gap-1.5" asChild>
          <Link href="/notices">
            <ArrowLeft className="h-3.5 w-3.5" />
            목록으로
          </Link>
        </Button>
        <nav className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Link href="/dashboard" className="hover:text-foreground transition-colors">
            대시보드
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/notices" className="hover:text-foreground transition-colors">
            공지사항
          </Link>
        </nav>
      </div>

      {/* 본문 카드 */}
      <Card className="border-border/50 mb-5 overflow-hidden py-4">
        {/* 카드 헤더 */}
        <div className="border-border/50 border-b px-8 py-6">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`flex h-5 w-14 shrink-0 items-center justify-center rounded text-[10px] font-medium ${CATEGORY_COLORS[notice.category]}`}
            >
              {notice.category}
            </span>
            {notice.isNew ? (
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                N
              </span>
            ) : null}
          </div>

          <h1 className="mb-4 text-lg leading-snug font-bold">{notice.title}</h1>

          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Calendar className="h-3 w-3" />
            <span>{notice.date}</span>
          </div>
        </div>

        {/* 본문 */}
        <CardContent className="px-8 py-7">
          <NoticeContent content={notice.content} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
