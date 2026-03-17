'use client'

import { useState, useEffect } from 'react'
import { getReportListAction } from '@/featured/history/actions/history.action'
import { InterviewReportItem, SortBy } from '@/featured/history/types'
import { useHistoryFilter } from '@/featured/history/hooks/useHistoryFilter'
import { HistoryFilterBar } from '@/featured/history/components/HistoryFilterBar'
import { HistoryContainer } from '@/featured/history/components/HistoryContainer'
import { HistoryPagination } from '@/featured/history/components/HistoryPagination'
import { useColumnsPerRow } from '@/featured/history/hooks/useColumnsPerRow'

export function HistoryLayout() {
  const [records, setRecords] = useState<InterviewReportItem[]>([])
  const { search, setSearch, sortBy, setSortBy, filtered } = useHistoryFilter(records)
  const cols = useColumnsPerRow()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = cols * 2
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const safePage = Math.min(currentPage, totalPages)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getReportListAction()
        if (response.success) {
          //  데이터가 null일 때를 대비한 방어막(?? []) 추가
          setRecords(response.data ?? [])
        }
      } catch (error) {
        console.error('리포트 목록을 불러오는데 실패했습니다.', error)
      }
    }
    fetchData()
  }, [])

  //  사용자가 검색어를 입력할 때, '검색어 변경' + '1페이지로 이동'을 동시에 해주는 함수
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch)
    setCurrentPage(1)
  }

  //  정렬 기준 바꿀 때도 1페이지로 이동하도록 묶어줌
  const handleSortChange = (newSort: SortBy) => {
    setSortBy(newSort)
    setCurrentPage(1)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-8 py-2">
      <HistoryFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
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
