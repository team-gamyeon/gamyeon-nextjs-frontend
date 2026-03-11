'use client'

import { useState, useEffect } from 'react'
import { useHistoryFilter } from '@/featured/history/hooks/useHistoryFilter'
import { HistoryFilterBar } from '@/featured/history/components/HistoryFilterBar'
import { HistoryContainer } from '@/featured/history/components/HistoryContainer'
import { HistoryPagination } from '@/featured/history/components/HistoryPagination'
import { useColumnsPerRow } from '@/featured/history/hooks/useColumnsPerRow'

export function HistoryLayout() {
  const { search, setSearch, sortBy, setSortBy, filtered } = useHistoryFilter()
  const cols = useColumnsPerRow()

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = cols * 2
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)

  // 검색/필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1)
  }, [filtered.length, search])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 py-2">
      <HistoryFilterBar
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <div className="flex flex-1 flex-col">
        <div className="flex-1">
          <HistoryContainer
            records={filtered}
            search={search}
            currentPage={safePage}
            itemsPerPage={itemsPerPage}
          />
        </div>

        <div className="mt-auto">
          <HistoryPagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  )
}
