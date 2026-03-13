// 1. API 명세에 맞춘 카테고리
export type NoticeCategory = 'NOTICE' | 'UPDATE' | 'GUIDE' | 'EVENT' | 'MAINTENANCE'

// 필터용 카테고리
export type FilterCategory = 'ALL' | NoticeCategory

// 2. 공지사항 목록 타입
export interface Notice {
  id: number
  category: NoticeCategory
  title: string
  createdAt: string
}

// 3. 공지사항 상세 타입
export interface NoticeDetailResponse {
  id: number
  category: NoticeCategory
  title: string
  content: string
  imageUrls: string[]
  createdAt: string
  updatedAt: string
}
