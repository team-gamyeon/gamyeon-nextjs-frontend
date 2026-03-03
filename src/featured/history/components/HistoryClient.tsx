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
      <HistoryList records={filtered} search={''} onSelect={setSelectedRecord} />
      <HistoryDetailDialog record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  )
}
