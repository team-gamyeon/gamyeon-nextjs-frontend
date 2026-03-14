import { useRef, useState } from 'react'
import type { FilterCategory, Notice } from '@/featured/notice/types'
import { debounce } from '@/shared/lib/utils/debounce'

export function useNoticeFilter(initialNotices: Notice[]) {
  const [search, setSearch] = useState('')
  // 성능 최적화
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [category, setCategory] = useState<FilterCategory>('ALL')
  const debouncedSetSearch = useRef(debounce(setDebouncedSearch, 300)).current

  function handleSearchChange(value: string) {
    setSearch(value)
    if (value === '') {
      setDebouncedSearch('')
    } else {
      debouncedSetSearch(value)
    }
  }

  const notices = initialNotices.filter((n) => {
    const matchesCategory = category === 'ALL' || n.category === category
    const matchesSearch = n.title.includes(debouncedSearch)
    return matchesCategory && matchesSearch
  })

  return { search, setSearch: handleSearchChange, category, setCategory, notices }
}
