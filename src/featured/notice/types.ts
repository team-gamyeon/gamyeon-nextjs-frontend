// 1. API 명세에 맞춘 카테고리 (영어)
export type NoticeCategory = 'NOTICE' | 'UPDATE' | 'GUIDE' | 'EVENT' | 'MAINTENANCE'

// (선택) 프론트엔드 필터용 카테고리가 필요하다면 이렇게 확장
export type FilterCategory = 'ALL' | NoticeCategory

// 2. 공지사항 목록 타입
export interface Notice {
  id: number
  category: NoticeCategory
  title: string
  createdAt: string // (기존 목업의 date 대신 API 명세인 createdAt 사용)
  isNew?: boolean // (목업에 있던 필드, API에 없다면 옵셔널 처리)
}

// 3. 공지사항 상세 타입
export interface NoticeDetail {
  id: number
  category: NoticeCategory
  title: string
  content: string
  imageUrls: string[]
  createdAt: string
  updatedAt: string
}
