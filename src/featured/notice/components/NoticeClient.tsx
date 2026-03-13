'use client'

// 1. Notice 타입을 가져옵니다.
import type { Notice } from '@/featured/notice/types'
import { useNoticeFilter } from '@/featured/notice/hooks/useNoticeFilter'
import { NoticeFilters } from '@/featured/notice/components/NoticeFilters'
import { NoticeList } from '@/featured/notice/components/NoticeList'

// 2. 부모 컴포넌트(서버)로부터 어떤 데이터를 받을지 규칙(Props)을 정해줍니다.
interface NoticeClientProps {
  initialNotices: Notice[]
}

// 3. 괄호 안에 { initialNotices }를 적어서 부모가 주는 진짜 데이터를 받습니다.
export function NoticeClient({ initialNotices }: NoticeClientProps) {
  // 4. 에러가 났던 빈 괄호 안에, 방금 받은 진짜 데이터(initialNotices)를 넣어줍니다!
  const { search, setSearch, category, setCategory, notices } = useNoticeFilter(initialNotices)

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
