import { ApiError } from './types'
import type { ApiResponse, ApiResult, RequestConfig } from './types'

/** endpoint + params → 완성된 URL 문자열 */
export function buildUrl(endpoint: string, params?: RequestConfig['params']): string {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${base}${path}`

  if (!params || Object.keys(params).length === 0) return url

  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    searchParams.set(key, String(value))
  }
  return `${url}?${searchParams.toString()}`
}

/**
 * 요청 body 직렬화.
 * - plain object / array → JSON.stringify (string 반환)
 * - FormData · Blob · ArrayBuffer 등 BodyInit → 그대로 반환 (Content-Type은 브라우저/런타임이 자동 설정)
 * - undefined → undefined (body 없음)
 */
export function serializeBody(body: unknown): BodyInit | undefined {
  if (body === undefined) return undefined
  if (
    typeof body === 'string' ||
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof URLSearchParams ||
    body instanceof ReadableStream
  ) {
    return body as BodyInit
  }
  return JSON.stringify(body)
}

/** 응답 body 파싱 — 204 또는 빈 body면 null 반환 */
export async function parseBody<T>(res: Response): Promise<T | null> {
  if (res.status === 204) return null

  const text = await res.text()
  if (!text.trim()) return null

  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

/**
 * 공통 응답 파싱 — parseBody 후 success 여부에 따라 ApiResult 반환.
 * toast/throw 없이 순수하게 { data, error }만 반환.
 * client.ts, serverApi.ts 양쪽에서 공유.
 */
export async function parseApiResponse<T>(res: Response): Promise<ApiResult<T>> {
  const body = await parseBody<ApiResponse<T>>(res)

  if (body === null) return { data: null, error: null }

  if (!body.success) {
    return {
      data: null,
      error: new ApiError(res.status, body.message, body.code, body.errors),
    }
  }

  return { data: body.data ?? null, error: null }
}
