// src/featured/notice/hooks/useNoticeFilter.ts
import { useRef, useState } from 'react'
// MOCK_NOTICES는 지우고, 진짜 타입인 Notice를 가져옵니다.
import type { FilterCategory, Notice } from '@/featured/notice/types'
import { debounce } from '@/shared/lib/utils/debounce'

// 이제 이 훅은 "서버에서 가져온 진짜 공지사항 목록(initialNotices)"을 재료로 받습니다.
export function useNoticeFilter(initialNotices: Notice[]) {
  const [search, setSearch] = useState('')
  // 성능 최적화
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // [수정 포인트 1] '전체'라는 한글 대신, types.ts에 정의된 'ALL'을 기본값으로 씁니다.
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

  // [수정 포인트 2] 가짜 데이터(MOCK_NOTICES) 대신, 인자로 받은 진짜 데이터(initialNotices)를 필터링합니다.
  const notices = initialNotices.filter((n) => {
    // 여기도 '전체' 대신 'ALL'로 비교합니다.
    const matchesCategory = category === 'ALL' || n.category === category
    const matchesSearch = n.title.includes(debouncedSearch)
    return matchesCategory && matchesSearch
  })

  return { search, setSearch: handleSearchChange, category, setCategory, notices }
}
