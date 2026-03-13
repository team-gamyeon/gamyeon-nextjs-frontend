import type { NoticeCategory, FilterCategory } from './types'

// 카테고리 설정값 모음
const NOTICE_CATEGORY: Record<NoticeCategory, { label: string; color: string }> = {
  NOTICE: {
    label: '공지',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  UPDATE: {
    label: '업데이트',
    color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  GUIDE: {
    label: '안내',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  EVENT: {
    label: '이벤트',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  },
  MAINTENANCE: {
    label: '점검',
    color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
}

// const NOTICE_PAGE_SIZE = 10;

// 화면에 그릴 필터 버튼 목록 (이것도 상수로 관리!)
// ❌ export 제거!
const FILTER_CATEGORIES: FilterCategory[] = [
  'ALL',
  'NOTICE',
  'UPDATE',
  'GUIDE',
  'EVENT',
  'MAINTENANCE',
]

// 여기서 한 번에 깔끔하게 내보냅니다.
export { NOTICE_CATEGORY, FILTER_CATEGORIES }
