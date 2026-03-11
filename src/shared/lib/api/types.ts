/** 필드 유효성 에러 */
export interface ApiFieldError {
  field: string
  reason: string
}

/** 서버 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean
  code: string
  message: string
  data?: T | null
  errors?: ApiFieldError[]
}

/** API 에러 — 서버가 내려준 값으로만 구성됨 */
export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly errors?: ApiFieldError[]

  constructor(status: number, message: string, code: string, errors?: ApiFieldError[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}

/** 서버 응답 없이 네트워크 자체가 실패한 경우 */
export class NetworkError extends ApiError {
  constructor() {
    super(0, '네트워크 오류가 발생했습니다.', 'NETWORK_ERROR')
    this.name = 'NetworkError'
  }
}

export type ApiResult<T> = { data: T | null; error: null } | { data: null; error: ApiError }

export interface RequestConfig {
  /** true이면 에러 toast를 띄우지 않음 */
  silent?: boolean
  /** URL 쿼리 파라미터 */
  params?: Record<string, string | number | boolean>
  headers?: Record<string, string>
  cache?: RequestCache
  next?: NextFetchRequestConfig
}
