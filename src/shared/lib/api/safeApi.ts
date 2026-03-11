import { api } from './api'
import { ApiError } from './types'
import type { ApiResult, RequestConfig } from './types'

/**
 * 클라이언트 컴포넌트 전용 — 절대 throw하지 않는 안전한 API 인터페이스.
 * 컴포넌트/훅에서 에러로 페이지가 터지는 걸 방지할 때 사용.
 *
 * @example
 * const { data, error } = await safeApi.get<User[]>('/users')
 * if (error) { // 에러 처리 }
 */
export const safeApi = {
  get: async <T>(endpoint: string, config?: RequestConfig): Promise<ApiResult<T>> => {
    try {
      const data = await api.get<T>(endpoint, config)
      return { data, error: null }
    } catch (error) {
      if (error instanceof ApiError) return { data: null, error }
      return { data: null, error: new ApiError(0, '알 수 없는 오류가 발생했습니다.', 'UNKNOWN') }
    }
  },

  post: async <T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResult<T>> => {
    try {
      const data = await api.post<T>(endpoint, body, config)
      return { data, error: null }
    } catch (error) {
      if (error instanceof ApiError) return { data: null, error }
      return { data: null, error: new ApiError(0, '알 수 없는 오류가 발생했습니다.', 'UNKNOWN') }
    }
  },

  put: async <T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResult<T>> => {
    try {
      const data = await api.put<T>(endpoint, body, config)
      return { data, error: null }
    } catch (error) {
      if (error instanceof ApiError) return { data: null, error }
      return { data: null, error: new ApiError(0, '알 수 없는 오류가 발생했습니다.', 'UNKNOWN') }
    }
  },

  patch: async <T>(
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResult<T>> => {
    try {
      const data = await api.patch<T>(endpoint, body, config)
      return { data, error: null }
    } catch (error) {
      if (error instanceof ApiError) return { data: null, error }
      return { data: null, error: new ApiError(0, '알 수 없는 오류가 발생했습니다.', 'UNKNOWN') }
    }
  },

  delete: async <T>(endpoint: string, config?: RequestConfig): Promise<ApiResult<T>> => {
    try {
      const data = await api.delete<T>(endpoint, config)
      return { data, error: null }
    } catch (error) {
      if (error instanceof ApiError) return { data: null, error }
      return { data: null, error: new ApiError(0, '알 수 없는 오류가 발생했습니다.', 'UNKNOWN') }
    }
  },
}
