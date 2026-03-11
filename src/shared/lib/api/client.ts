import { toast } from 'sonner'
import { ApiError, NetworkError, type RequestConfig } from './types'
import { buildUrl, parseApiResponse } from './_utils'

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
  return res.ok
}

/**
 * refresh를 최대 2번 시도.
 * 동시에 여러 요청이 401을 받아도 refresh는 1번만 실행됨.
 */
async function attemptRefresh(): Promise<boolean> {
  if (isRefreshing) return waitForRefresh()

  isRefreshing = true
  try {
    // 1차 refresh
    const first = await refreshOnce()
    if (first) {
      resolveQueue(true)
      return true
    }

    // 2차 refresh (1차 실패 시)
    const second = await refreshOnce()
    resolveQueue(second)
    return second
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
 * @throws {ApiError}     서버가 success: false를 반환한 경우
 * @throws {NetworkError} 네트워크 자체가 실패한 경우
 */
export async function clientFetch<T>(
  endpoint: string,
  config?: RequestConfig & { method?: string; body?: BodyInit | null },
): Promise<T | null> {
  const url = buildUrl(endpoint, config?.params)
  const init: RequestInit = {
    method: config?.method ?? 'GET',
    credentials: 'include',
    headers: {
      // string(JSON)일 때만 Content-Type 지정
      // FormData·Blob 등은 런타임이 자동으로 설정하도록 생략
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
    const { data, error } = await parseApiResponse<T>(res)
    if (error) {
      if (!config?.silent) toast.error(error.message)
      throw error
    }
    return data
  }

  // ── 401 → refresh 최대 2회 시도 ──
  const refreshed = await attemptRefresh()
  if (!refreshed) {
    redirectToSignin()
    throw new ApiError(401, '인증이 만료되었습니다. 다시 로그인해 주세요.', 'AUTH_EXPIRED')
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

  const { data, error } = await parseApiResponse<T>(retryRes)
  if (error) {
    if (!config?.silent) toast.error(error.message)
    throw error
  }
  return data
}
