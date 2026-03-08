'use client'

import { useRef, useState } from 'react'
import type { FilterCategory } from '@/featured/notice/types'
import { MOCK_NOTICES } from '@/featured/notice/types'
import { debounce } from '@/shared/lib/utils/debounce'

export function useNoticeFilter() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState<FilterCategory>('전체')

  const debouncedSetSearch = useRef(debounce(setDebouncedSearch, 300)).current

  function handleSearchChange(value: string) {
    setSearch(value)
    if (value === '') {
      setDebouncedSearch('')
    } else {
      debouncedSetSearch(value)
    }
  }

  const notices = MOCK_NOTICES.filter((n) => {
    const matchesCategory = category === '전체' || n.category === category
    const matchesSearch = n.title.includes(debouncedSearch)
    return matchesCategory && matchesSearch
  })

  return { search, setSearch: handleSearchChange, category, setCategory, notices }
}
