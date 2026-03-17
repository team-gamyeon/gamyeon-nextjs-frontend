import { isRedirectError } from 'next/dist/client/components/redirect-error'
import type { ApiResponse } from './api'

/**
 * handleResponse가 실패 시 throw하는 객체는 이미 ApiResponse 형태입니다.
 * 해당 객체를 그대로 반환하고, 아닌 경우(NetworkError 등)는 일반 에러 메시지로 변환합니다.
 */
export function toApiError<T>(error: unknown): ApiResponse<T> {
  if (
    error !== null &&
    typeof error === 'object' &&
    'success' in error &&
    'code' in error &&
    'message' in error
  ) {
    return error as ApiResponse<T>
  }
  return {
    success: false,
    code: 'NETWORK_ERROR',
    message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    data: null,
  }
}

/**
 * Server Action 래퍼.
 * - isRedirectError(Next.js redirect/notFound)는 항상 re-throw
 * - 나머지 에러는 toApiError로 ApiResponse 형태로 변환해서 반환
 */
export async function withAction<T>(
  action: () => Promise<ApiResponse<T>>,
): Promise<ApiResponse<T>> {
  try {
    return await action()
  } catch (error) {
    if (isRedirectError(error)) throw error
    return toApiError<T>(error)
  }
}
