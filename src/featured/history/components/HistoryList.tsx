'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { FileText, Inbox } from 'lucide-react'
import { InterviewRecord } from '@/featured/history/types'
import { PendingCard } from '@/featured/history/components/cards/PedingCard'
import { AnalysingCard } from '@/featured/history/components/cards/AnalysingCard'
import { CardContainer } from '@/featured/history/components/cards/CardContainer'
import {
  CompletedCardBack,
  CompletedCardFront,
} from '@/featured/history/components/cards/CompletedCard'

interface HistoryListProps {
  records: InterviewRecord[]
  search: string
  onSelect: (record: InterviewRecord) => void
}

interface FlipCardProps {
  record: InterviewRecord
}

function useColumnsPerRow() {
  const [cols, setCols] = useState(2)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setCols(w >= 1280 ? 5 : w >= 1024 ? 4 : w >= 640 ? 3 : 2)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return cols
}

function FlipCard({ record }: FlipCardProps) {
  const router = useRouter()
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const isCompleted = record.status === 'completed'

  const handleClick = () => {
    if (isCompleted) {
      router.push(`/result/${record.id}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => {
        if (isCompleted) {
          setIsHovered(true)
          setIsFlipped(true)
        }
      }}
      onMouseLeave={() => {
        if (isCompleted) {
          setIsHovered(false)
          setIsFlipped(false)
        }
      }}
      className={`h-full w-full ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <CardContainer isFlipped={isFlipped} isHovered={isHovered}>
        <Card className="absolute inset-0 flex flex-col overflow-hidden backface-hidden">
          {record.status === 'completed' && <CompletedCardFront record={record} />}
          {record.status === 'pending' && <PendingCard />}
          {record.status === 'analysing' && <AnalysingCard />}
        </Card>
        {isCompleted && (
          <Card
            className="absolute inset-0 backface-hidden antialiased"
            style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
          >
            <CompletedCardBack record={record} />
          </Card>
        )}
      </CardContainer>
    </div>
  )
}

export function HistoryList({ records, search, onSelect }: HistoryListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const cols = useColumnsPerRow()
  const itemsPerPage = cols * 2

  const totalPages = Math.max(1, Math.ceil(records.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)
  const start = (safePage - 1) * itemsPerPage
  const pageRecords = records.slice(start, start + itemsPerPage)

  // 검색/필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1)
  }, [records.length, search])

  if (records.length === 0) {
    if (search) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[calc(100vh-250px)] flex-col items-center justify-center text-center"
        >
          <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
            <FileText className="text-muted-foreground h-7 w-7" />
          </div>
          <h3 className="mb-1 text-lg font-semibold">기록이 없습니다</h3>
          <p className="text-muted-foreground mb-6 text-sm">
            검색 결과가 없습니다. 다른 키워드로 검색해보세요.
          </p>
        </motion.div>
      )
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[calc(100vh-250px)] flex-col items-center justify-center text-center"
      >
        <Link
          href="/interview"
          className="group flex cursor-pointer flex-col items-center justify-center"
        >
          <div className="bg-primary/10 text-primary mb-6 rounded-full p-4 transition-transform duration-300 group-hover:scale-110">
            <Inbox className="h-8 w-8" />
          </div>

          <div className="mb-8 flex flex-col items-center gap-1.5">
            <h3 className="text-foreground text-xl font-bold">진행된 면접 기록이 없습니다.</h3>
            <p className="text-muted-foreground text-sm">
              아직 면접 연습 기록이 없습니다. 첫 면접을 시작해보세요!
            </p>
          </div>

          <span className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md px-8 py-3 text-base font-semibold shadow-sm transition-colors">
            첫 면접 시작하기 &rarr;
          </span>
        </Link>
      </motion.div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
        {pageRecords.map((record, i) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            <FlipCard record={record} />
          </motion.div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-auto flex items-center justify-center gap-2 py-2">
          <Button
            variant="outline"
            size="sm"
            disabled={safePage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            이전
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={page === safePage ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            disabled={safePage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  )
}
