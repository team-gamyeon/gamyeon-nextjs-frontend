'use client'

import { useHistoryFilter } from '@/featured/history/hooks/useHistoryFilter'
import { HistoryFilters } from '@/featured/history/components/HistoryFilters'
import { HistoryList } from '@/featured/history/components/HistoryList'
import { HistoryDetailDialog } from '@/featured/history/components/HistoryDetailDialog'

export function HistoryClient() {
  const { search, setSearch, sortBy, setSortBy, selectedRecord, setSelectedRecord, filtered } =
    useHistoryFilter()

  return (
    <div className="px-8 py-6">
      <HistoryFilters
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* // 신규유저 테스트용 코드 (확인 후 원래대로 복구하세요!) */}
      {/* <HistoryList records={[]} search={''} onSelect={setSelectedRecord} /> */}
      <HistoryList records={filtered} search={'search'} onSelect={setSelectedRecord} />
      <HistoryDetailDialog record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  )
}
