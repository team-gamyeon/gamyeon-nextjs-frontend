export type NoticeCategory = '업데이트' | '안내' | '이벤트' | '공지사항'

export type FilterCategory = '전체' | NoticeCategory

export interface Notice {
  id: number
  category: NoticeCategory
  title: string
  date: string
  isNew: boolean
}

export const CATEGORY_COLORS: Record<NoticeCategory, string> = {
  업데이트: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  안내: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  이벤트: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  공지사항: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400',
}

export const FILTER_CATEGORIES: FilterCategory[] = ['전체', '업데이트', '안내', '이벤트', '공지사항']

export const MOCK_NOTICES: Notice[] = [
  {
    id: 1,
    category: '업데이트',
    title: '프론트엔드 직무 모의 면접 질문 세트가 추가되었습니다.',
    date: '2026.03.08',
    isNew: true,
  },
  {
    id: 2,
    category: '안내',
    title: '보다 안정적인 서비스를 위한 서버 정기 점검 안내 (3/10)',
    date: '2026.03.05',
    isNew: false,
  },
  {
    id: 3,
    category: '이벤트',
    title: '2026년 상반기 공채 대비 AI 면접 무제한 패스!',
    date: '2026.03.01',
    isNew: false,
  },
  {
    id: 4,
    category: '공지사항',
    title: 'AI 면접관 음성 인식 속도 및 정확도 대폭 개선 안내',
    date: '2026.02.26',
    isNew: false,
  },
  {
    id: 5,
    category: '업데이트',
    title: '백엔드/데브옵스 직무 면접 문제 세트 추가',
    date: '2026.02.20',
    isNew: false,
  },
  {
    id: 6,
    category: '안내',
    title: '개인정보처리방침 개정 안내',
    date: '2026.02.15',
    isNew: false,
  },
  {
    id: 7,
    category: '이벤트',
    title: '친구 초대 이벤트: 함께 면접 준비하고 혜택 받기',
    date: '2026.02.10',
    isNew: false,
  },
  {
    id: 8,
    category: '공지사항',
    title: '서비스 이용약관 변경 안내',
    date: '2026.02.05',
    isNew: false,
  },
]
