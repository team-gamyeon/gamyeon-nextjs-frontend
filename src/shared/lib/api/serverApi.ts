import { cookies } from 'next/headers'
import { NetworkError } from './types'
import type { RequestConfig } from './types'
import { buildUrl, parseApiResponse } from './_utils'

/**
 * 서버 전용 내부 fetcher.
 * next/headers로 쿠키를 읽어 Cookie 헤더에 직접 포함.
 * 미들웨어(proxy)가 인증을 선처리하므로 401 refresh 로직 없음.
 * 에러 발생 시 throw — 호출 측에서 try/catch 사용.
 */
async function serverFetch<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<T> {
  const cookieStore = await cookies()
  const url = buildUrl(endpoint, config?.params)
  const jsonBody = body !== undefined ? JSON.stringify(body) : undefined

  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers: {
        ...(jsonBody !== undefined && { 'Content-Type': 'application/json' }),
        Cookie: cookieStore.toString(),
        ...config?.headers,
      },
      body: jsonBody,
      cache: config?.cache,
      next: config?.next,
    })
  } catch {
    throw new NetworkError()
  }

  const { data, error } = await parseApiResponse<T>(res)
  if (error) throw error
  return data as T
}

/**
 * 서버 전용 API 인터페이스.
 * Server Action, service 레이어, RSC에서 사용.
 * 클라이언트 컴포넌트에서 import 금지 (next/headers는 서버 전용).
 * 에러 발생 시 throw — 호출 측에서 try/catch 사용.
 *
 * @example
 * // RSC
 * const data = await serverApi.get<User>('/me')
 *
 * // Server Action (에러를 클라이언트에 직접 노출하면 안 되므로 try/catch 필수)
 * try {
 *   const data = await serverApi.post('/interviews', body)
 *   return { success: true, data }
 * } catch (error) {
 *   return { success: false, message: error.message }
 * }
 */
export const serverApi = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    serverFetch<T>('GET', endpoint, undefined, config),

  post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    serverFetch<T>('POST', endpoint, body, config),

  put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    serverFetch<T>('PUT', endpoint, body, config),

  patch: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    serverFetch<T>('PATCH', endpoint, body, config),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    serverFetch<T>('DELETE', endpoint, undefined, config),
}
