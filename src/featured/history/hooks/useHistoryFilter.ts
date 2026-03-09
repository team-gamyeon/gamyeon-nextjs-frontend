'use client'

import { useState } from 'react'
import type { SortBy, InterviewRecord } from '@/featured/history/types'
import { MOCK_RECORDS } from '@/featured/history/types'

export function useHistoryFilter() {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [selectedRecord, setSelectedRecord] = useState<InterviewRecord | null>(null)

  const filtered = MOCK_RECORDS.filter((r) => r.position.includes(search)).sort((a, b) => {
    if (sortBy === 'score') {
      if (a.score === null) return 1
      if (b.score === null) return -1

      return b.score - a.score
    }
    return b.date.localeCompare(a.date)
  })

  return {
    search,
    setSearch,
    sortBy,
    setSortBy,
    selectedRecord,
    setSelectedRecord,
    filtered,
  }
}
