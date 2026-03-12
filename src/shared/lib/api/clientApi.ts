import { buildUrl, parseApiResponse, serializeBody } from './_utils'
import { NetworkError, RequestConfig } from './types'
import { toast } from 'sonner'

// ─── 401 refresh 동시 요청 방지 ────────────────────────────────────────────────
// 1. "지금 새 입장권(토큰)을 받아오고 있는 중이야?" (처음엔 아니니까 false)
let isRefreshing = false

//void는 영어로 '빈 공간, 아무것도 없음
// "이 선반(배열)에는 **스위치(함수)**만 올려둘 수 있는데,
//  그 스위치는 누를 때 반드시 **성공(true)했는지 실패(false)했는지 쪽지(success: boolean)**를 같이 넣어서 눌러야 하고,
// 누른 다음에 아무것도 뱉어내지 않는(=> void) 스위치여야만 해!
// 앞으로 여기에 resolve 같은 스위치를 담을 건데, 그 스위치는 성공 여부(boolean)를 알려주는 역할
let pendingQueue: Array<(success: boolean) => void> = []

// 2. pendingQueue: "진동벨 스위치(resolve)들을 모아두는 선반(배열)"
function waitForRefresh(): Promise<boolean> {
  // Promise는 자바스크립트의 비동기 처리 객체, 약속(Promise)**하는 객체(도구)

  // 3. 진동벨(Promise)을 하나 만들어서 손님한테 줍니다.
  return new Promise((resolve) => {
    // 4. Promise를 리턴하는데, resolve 함수 자체를 배열(Queue)에 밀어 넣습니다.
    //  원래는 여기서 햄버거 다 만들고 resolve()를 바로 눌러야 하는데,
    // 지금 누르지 않고 '진동벨 스위치(resolve)'를 선반(pendingQueue)에 쓱 밀어 넣어(push) 둡니다.
    // resolve"너가 원하는 작업이 성공적으로 끝났을 때 이 스위치를 눌러!"라는 뜻
    pendingQueue.push(resolve) //
  })
}

function resolveQueue(success: boolean) {
  // 선반(pendingQueue)에 있는 스위치(resolve)들을 하나씩 꺼내서 success(true 또는 false) 쪽지를 넣고 눌러줍니다!
  pendingQueue.forEach((resolve) => resolve(success))

  // 스위치를 다 눌렀으니 선반을 다시 비워줍니다.
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
    return null
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
