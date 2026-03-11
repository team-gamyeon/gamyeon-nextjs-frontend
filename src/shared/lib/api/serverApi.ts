import { cookies } from 'next/headers'
import { NetworkError } from './types'
import type { ApiResult, RequestConfig } from './types'
import { buildUrl, parseApiResponse } from './_utils'

/**
 * 서버 전용 내부 fetcher.
 * next/headers로 쿠키를 읽어 Cookie 헤더에 직접 포함.
 * 미들웨어(proxy)가 인증을 선처리하므로 401 refresh 로직 없음.
 * 절대 throw하지 않고 { data, error } 형태로 반환.
 */
async function serverFetch<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<ApiResult<T>> {
  try {
    const cookieStore = await cookies()
    const url = buildUrl(endpoint, config?.params)
    const jsonBody = body !== undefined ? JSON.stringify(body) : undefined

    const res = await fetch(url, {
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

    return await parseApiResponse<T>(res)
  } catch {
    return { data: null, error: new NetworkError() }
  }
}

/**
 * 서버 전용 API 인터페이스.
 * Server Action, service 레이어, RSC에서 사용.
 * 클라이언트 컴포넌트에서 import 금지 (next/headers는 서버 전용).
 *
 * @example
 * 'use server'
 * export async function getMe() {
 *   const { data, error } = await serverApi.get<User>('/me')
 *   if (error) return null
 *   return data
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
