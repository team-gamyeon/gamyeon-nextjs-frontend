'use client'

import { Search } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import type { FilterCategory } from '@/featured/notice/types'
import { NOTICE_CATEGORY, FILTER_CATEGORIES } from '@/featured/notice/constants'

interface NoticeFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  category: FilterCategory
  onCategoryChange: (value: FilterCategory) => void
}

export function NoticeFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
}: NoticeFiltersProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {FILTER_CATEGORIES.map((c) => {
          const label = c === 'ALL' ? '전체' : NOTICE_CATEGORY[c]?.label

          return (
            <Button
              key={c}
              variant={category === c ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(c)}
              className="h-7 cursor-pointer px-3 text-xs"
            >
              {label}
            </Button>
          )
        })}
      </div>

      <div className="relative w-full sm:w-96">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="공지사항 검색"
          className="h-8 pl-8 text-sm"
        />
      </div>
    </div>
  )
}
