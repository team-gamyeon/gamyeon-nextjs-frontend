import { buildUrl, handleResponse, serializeBody } from './_utils'
import { ApiResponse, NetworkError } from './types'
import type { RequestConfig } from './types'
import { toast } from 'sonner'

// ─── 401 refresh 동시 요청 방지 ────────────────────────────────────────────────
let isRefreshing = false
let pendingQueue: Array<(success: boolean) => void> = []

function waitForRefresh(): Promise<boolean> {
  return new Promise((resolve) => {
    pendingQueue.push(resolve)
  })
}

function resolveQueue(success: boolean) {
  pendingQueue.forEach((resolve) => resolve(success))
  pendingQueue = []
}

/** refresh 엔드포인트 단건 호출 */
async function refreshOnce(): Promise<boolean> {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) return false
  const data = await res.json()
  return data.success === true
}

/**
 * refresh 1회 시도.
 * 동시에 여러 요청이 401을 받아도 refresh는 1번만 실행됨.
 */
async function attemptRefresh(): Promise<boolean> {
  if (isRefreshing) return waitForRefresh()

  isRefreshing = true
  try {
    const success = await refreshOnce()
    resolveQueue(success)
    return success
  } catch {
    resolveQueue(false)
    return false
  } finally {
    isRefreshing = false
  }
}

function redirectToSignin() {
  if (typeof window !== 'undefined') {
    window.location.replace('/signin')
  }
}

// ─── 메인 fetcher ─────────────────────────────────────────────────────────────

/**
 * 인증 쿠키를 자동으로 포함하는 클라이언트 전용 fetch 래퍼.
 *
 * 401 처리 흐름:
 *   원래 요청 → 401
 *     → refresh 최대 2회 시도
 *       ├── 성공 → 토큰 갱신 → 원래 요청 재시도
 *       └── 모두 실패 → /signin redirect
 *
 */
export async function clientFetch<T>(
  endpoint: string,
  config?: RequestConfig & { method?: string; body?: BodyInit | null },
): Promise<ApiResponse<T>> {
  const url = buildUrl(endpoint, config?.params)
  const init: RequestInit = {
    method: config?.method ?? 'GET',
    credentials: 'include',
    headers: {
      ...(typeof config?.body === 'string' && { 'Content-Type': 'application/json' }),
      ...config?.headers,
    },
    body: config?.body,
    cache: config?.cache,
    next: config?.next,
  }

  // ── 원래 요청 ──
  let res: Response
  try {
    res = await fetch(url, init)
  } catch {
    const error = new NetworkError()
    if (!config?.silent) toast.error(error.message)
    throw error
  }

  if (res.status !== 401) {
    return await handleResponse<T>(res, config)
  }

  // ── 401 → refresh 최대 2회 시도 ──
  const refreshed = await attemptRefresh()
  if (!refreshed) {
    redirectToSignin()
    return {
      success: false,
      code: 'AUTH_EXPIRED',
      message: '인증 만료',
      data: null as T,
      errors: null,
    }
  }

  // ── refresh 성공 → 원래 요청 재시도 ──
  let retryRes: Response
  try {
    retryRes = await fetch(url, init)
  } catch {
    const error = new NetworkError()
    if (!config?.silent) toast.error(error.message)
    throw error
  }
  return await handleResponse<T>(retryRes, config)
}

function requestWithoutBody<T>(
  method: string,
  endpoint: string,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return clientFetch<T>(endpoint, { ...config, method })
}

function requestWithBody<T>(
  method: string,
  endpoint: string,
  body?: unknown,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return clientFetch<T>(endpoint, { ...config, method, body: serializeBody(body) })
}

/**
 * 클라이언트 컴포넌트 전용 API 인터페이스.
 * 에러 발생 시 throw — 호출 측에서 try/catch 사용.
 *
 * @example
 * const data = await clientApi.get<User[]>('/users')
 * await clientApi.post('/login', { email, password })
 * await clientApi.get('/users', { silent: true })  // toast 비활성화
 */
export const clientApi = {
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
