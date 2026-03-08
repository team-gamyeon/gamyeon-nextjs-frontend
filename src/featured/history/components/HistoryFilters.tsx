'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Search, Calendar, ArrowUpDown, Plus } from 'lucide-react'
import type { SortBy } from '@/featured/history/types'

interface HistoryFiltersProps {
  search: string
  sortBy: SortBy
  onSearchChange: (value: string) => void
  onSortChange: (sort: SortBy) => void
}

export function HistoryFilters({
  search,
  sortBy,
  onSearchChange,
  onSortChange,
}: HistoryFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="직무로 검색..."
          className="pl-10"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button
          variant={sortBy === 'date' ? 'default' : 'outline'}
          size="sm"
          className="gap-1.5"
          onClick={() => onSortChange('date')}
        >
          <Calendar className="h-3.5 w-3.5" />
          최신순
        </Button>
        <Button
          variant={sortBy === 'score' ? 'default' : 'outline'}
          size="sm"
          className="gap-1.5"
          onClick={() => onSortChange('score')}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          점수순
        </Button>
        <Button size="sm" className="gap-1.5" asChild>
          <Link href="/upload">
            <Plus className="h-3.5 w-3.5" />새 면접
          </Link>
        </Button>
      </div>
    </motion.div>
  )
}
