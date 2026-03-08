'use client'

import { useNoticeFilter } from '@/featured/notice/hooks/useNoticeFilter'
import { NoticeFilters } from '@/featured/notice/components/NoticeFilters'
import { NoticeList } from '@/featured/notice/components/NoticeList'

export function NoticeClient() {
  const { search, setSearch, category, setCategory, notices } = useNoticeFilter()

  return (
    <div className="px-8 py-6">
      <NoticeFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
      />
      <NoticeList notices={notices} search={search} />
    </div>
  )
}
