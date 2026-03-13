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
  success: boolean
  code: string
  message: string
  data: T | null
  errors?: ApiFieldError[] | null
}

export type ApiResult<T> =
  | {
      success: true
      message: string
      code: string
      data: T | null
      errors: null
    }
  | {
      success: false
      message: string
      code: string
      data: null
      errors: ApiFieldError[] | null
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
