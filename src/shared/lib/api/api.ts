import { clientFetch } from './client'
import { serializeBody } from './_utils'
import type { RequestConfig } from './types'

/** body 없는 메서드용 (GET, DELETE) */
function requestWithoutBody<T>(method: string, endpoint: string, config?: RequestConfig) {
  return clientFetch<T>(endpoint, { ...config, method })
}

/** body 있는 메서드용 (POST, PUT, PATCH) */
function requestWithBody<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  config?: RequestConfig,
) {
  return clientFetch<T>(endpoint, {
    ...config,
    method,
    body: serializeBody(body),
  })
}

/**
 * 클라이언트 컴포넌트 전용 API 인터페이스.
 * 에러 발생 시 throw — 호출 측에서 try/catch 또는 safeApi 사용.
 *
 * @example
 * const data = await api.get<User[]>('/users')
 * await api.post('/login', { email, password })
 * await api.get('/users', { silent: true })  // toast 비활성화
 */
export const api = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    requestWithoutBody<T>('GET', endpoint, config),

  post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    requestWithBody<T>('POST', endpoint, body, config),

  put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    requestWithBody<T>('PUT', endpoint, body, config),

  patch: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    requestWithBody<T>('PATCH', endpoint, body, config),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    requestWithoutBody<T>('DELETE', endpoint, config),
}
