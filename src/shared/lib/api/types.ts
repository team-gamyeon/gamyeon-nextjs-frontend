/** 필드 유효성 에러 */
export interface ApiFieldError {
  field: string
  reason: string
}

/** 네트워크 단절/요청 실패 에러 */
export class NetworkError extends Error {
  constructor(message = '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.') {
    super(message)
    this.name = 'NetworkError'
  }
}

/** 서버 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean // 1️⃣ 성공 여부 (true / false)
  code: string // 2️⃣ 상태 코드 (예: "CMMN-S000", "ERROR-001")
  message: string // 3️⃣ 안내 메시지 (예: "성공", "불러오기 실패")
  data: T | null // 4️⃣ 진짜 데이터 (들어있을 수도 있고, 비어있을 수도 있음!)
  errors?: ApiFieldError[] | null // 5️⃣ (선택) 상세 에러 내역
}

export interface RequestConfig {
  /** true이면 에러 toast를 띄우지 않음 */
  silent?: boolean
  /** URL 쿼리 파라미터 */
  params?: Record<string, string | number | boolean>
  headers?: Record<string, string>
  cache?: RequestCache
  next?: NextFetchRequestConfig
}
