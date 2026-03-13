'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Calendar, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

// [수정 1] 컴포넌트 이름(NoticeDetail)과 타입 이름이 똑같아서 헷갈리므로, 타입의 이름을 'NoticeDetailData'로 살짝 바꿔서 부릅니다.
import type { Notice, NoticeDetailResponse } from '@/featured/notice/types'
// [수정 2] 가짜 색상표 대신, 우리가 만든 진짜 꾸미기 사전(config)을 가져옵니다.
import { NOTICE_CATEGORY } from '@/featured/notice/constants'
// [수정 3] 서버의 못생긴 날짜를 예쁘게 다듬을 가위(함수)를 가져옵니다.
import { formatDateDot } from '@/shared/lib/utils/date'

// [수정 4] 부모가 주는 상세 데이터의 타입을 새로운 'NoticeDetailData'로 지정합니다.
interface NoticeDetailProps {
  notice: NoticeDetailResponse
  prevNotice: Notice | null
  nextNotice: Notice | null
}

// 본문을 그려주는 함수 (이 부분은 기존 로직이 아주 훌륭해서 그대로 둡니다!)
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

// [수정 5] 서버는 '새 글'인지 안 알려주므로, 리스트에서 썼던 계산기를 똑같이 가져옵니다.
const checkIsRecent = (dateString: string) => {
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000 // 3일 치 시간
  return new Date(dateString).getTime() > Date.now() - THREE_DAYS_MS
}

export function NoticeDetail({ notice, prevNotice, nextNotice }: NoticeDetailProps) {
  const shouldReduceMotion = useReducedMotion()

  // [수정 6] 영어 카테고리를 한글과 색상으로 통역해 주는 사전(config)을 씁니다.
  const config = NOTICE_CATEGORY[notice.category] || NOTICE_CATEGORY.NOTICE
  const isRecent = checkIsRecent(notice.createdAt)

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
            {/* [수정 7] config 사전에서 한글 이름(label)과 색상(color)을 꺼내서 씁니다! */}
            <span
              className={`flex h-5 w-14 shrink-0 items-center justify-center rounded text-[10px] font-medium ${config.color}`}
            >
              {config.label}
            </span>
            {isRecent ? (
              <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                N
              </span>
            ) : null}
          </div>

          <h1 className="mb-4 text-lg leading-snug font-bold">{notice.title}</h1>

          <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <Calendar className="h-3 w-3" />
            {/* [수정 8] 가짜 date 대신 서버의 createdAt을 예쁘게 포장해서 씁니다. */}
            <span>{formatDateDot(new Date(notice.createdAt))}</span>
          </div>
        </div>

        {/* 본문 내용 + 첨부 이미지 */}
        <CardContent className="px-8 py-7">
          {/* 글씨 본문 */}
          <NoticeContent content={notice.content} />

          {/* [수정 9] 새 API에 추가된 '첨부 이미지(imageUrls)'를 그리는 화면을 추가했습니다! */}
          {notice.imageUrls && notice.imageUrls.length > 0 && (
            <div className="mt-8 flex flex-col gap-4">
              {notice.imageUrls.map((url, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={index}
                  src={url}
                  alt={`공지사항 첨부 이미지 ${index + 1}`}
                  className="w-full max-w-2xl rounded-lg border"
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* [보너스 수정] 기껏 받아온 이전글/다음글(prevNotice, nextNotice)을 화면 밑에 예쁘게 달아주면 좋습니다! (선택 사항) */}
    </motion.div>
  )
}
