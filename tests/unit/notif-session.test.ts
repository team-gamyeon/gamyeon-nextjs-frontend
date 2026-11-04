import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchEventSourceInit } from '@microsoft/fetch-event-source'
import type { User } from '@/featured/auth/types'
import type { ApiResponse } from '@/shared/lib/api'
import type { Notif, NotifListData } from '@/featured/notif/types'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  read: vi.fn(),
  refresh: vi.fn(),
  source: vi.fn(),
  logout: vi.fn(),
  redirect: vi.fn(),
  cleanups: [] as (() => void)[],
}))

// Keep the real session listener, subscription, actions and notification store.
// Run effect callbacks directly so auth can change before React cleans up an old effect.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useCallback: (callback: unknown) => callback,
  useMemo: (factory: () => unknown) => factory(),
  useSyncExternalStore: (_subscribe: unknown, getSnapshot: () => unknown) => getSnapshot(),
  useRef: (current: unknown) => ({ current }),
  useEffect: (effect: () => (() => void) | undefined) => {
    const cleanup = effect()
    if (cleanup) mocks.cleanups.push(cleanup)
  },
}))

vi.mock('@/featured/auth/actions/auth.action', () => ({ refreshAuthSession: mocks.refresh }))
vi.mock('@microsoft/fetch-event-source', () => ({
  EventStreamContentType: 'text/event-stream',
  fetchEventSource: mocks.source,
}))
vi.mock('@/featured/notif/actions/notif.action', () => ({
  getNotifsAction: mocks.get,
  markNotifAsReadAction: mocks.read,
  markAllNotifsAsReadAction: vi.fn(),
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((done, fail) => {
    resolve = done
    reject = fail
  })
  return { promise, resolve, reject }
}

function notif(id: number): Notif {
  return {
    notifId: id,
    notifType: 'NOTICE',
    title: '알림',
    content: '내용',
    targetId: id,
    isRead: false,
    createdAt: new Date(1700000000000 + id * 1000).toISOString(),
  }
}

function user(id: number): User {
  return {
    id,
    email: `user${id}@example.com`,
    nickname: `사용자${id}`,
    provider: 'google',
    status: 'ACTIVE',
    createdAt: '2026-11-03T00:00:00Z',
  }
}

function list(id: number, hasNext = true): ApiResponse<NotifListData> {
  return {
    success: true,
    code: 'OK',
    message: '',
    data: { notifs: [notif(id)], unreadCount: id, hasNext, nextCursorId: hasNext ? id : null },
  }
}

const failure: ApiResponse<NotifListData> = {
  success: false,
  code: 'FAILED',
  message: '조회 실패',
  data: null,
}
let auth: typeof import('@/featured/auth/store').useAuthStore
let store: typeof import('@/featured/notif/store').useNotifStore
let actions: ReturnType<typeof import('@/featured/notif/hooks/useNotifActions').useNotifActions>
let subscribe: typeof import('@/featured/notif/hooks/useNotifSubscription').useNotifSubscription
let clearSession: typeof import('@/featured/notif/hooks/notifClientSession').clearNotifClientSession

beforeEach(async () => {
  vi.useFakeTimers()
  vi.resetModules()
  vi.resetAllMocks()
  vi.stubGlobal('window', { location: { replace: mocks.redirect } })
  vi.stubGlobal('document', {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  mocks.cleanups = []
  mocks.get.mockResolvedValue(list(1))
  mocks.read.mockResolvedValue({ success: true, code: 'OK', message: '', data: null })
  mocks.source.mockImplementation(
    (_url: string, options: FetchEventSourceInit) =>
      new Promise<void>((resolve) => options.signal?.addEventListener('abort', () => resolve())),
  )
  const { createStore } = await import('zustand/vanilla')
  const authStore = createStore(() => ({
    user: user(1) as User | null,
    isLoggedIn: true,
    logout: mocks.logout,
  }))
  vi.doMock('@/featured/auth/store', () => ({
    useAuthStore: Object.assign(
      (selector: (state: ReturnType<typeof authStore.getState>) => unknown) =>
        selector(authStore.getState()),
      authStore,
    ),
  }))
  auth = (await import('@/featured/auth/store')).useAuthStore
  mocks.logout.mockImplementation(() => auth.setState({ user: null, isLoggedIn: false }))
  store = (await import('@/featured/notif/store')).useNotifStore
  actions = (await import('@/featured/notif/hooks/useNotifActions')).useNotifActions()
  subscribe = (await import('@/featured/notif/hooks/useNotifSubscription')).useNotifSubscription
  clearSession = (await import('@/featured/notif/hooks/notifClientSession')).clearNotifClientSession
})

afterEach(() => {
  mocks.cleanups.forEach((cleanup) => cleanup())
  clearSession()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function switchAccount(id: number | null) {
  auth.setState({ user: id === null ? null : user(id), isLoggedIn: id !== null })
}

function mount() {
  subscribe()
  return mocks.source.mock.calls.at(-1)![1] as FetchEventSourceInit
}

function receive(stream: FetchEventSourceInit, id: number) {
  stream.onmessage!({ event: 'notif', data: JSON.stringify(notif(id)), id: '' })
}

describe('알림 계정 전환 격리', () => {
  it.each(['성공', '실패 응답', '예외'] as const)(
    'A 조회가 늦게 %s해도 B 조회를 기다리게 하거나 B 로딩·결과를 변경하지 않는다',
    async (outcome) => {
      const old = deferred<ApiResponse<NotifListData>>()
      const current = deferred<ApiResponse<NotifListData>>()
      mocks.get.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
      const loadingA = actions.fetchInitialNotifs('1')
      const settledA = loadingA.catch(() => undefined)

      switchAccount(2)
      const loadingB = actions.fetchInitialNotifs('2')
      expect(mocks.get).toHaveBeenCalledTimes(2)
      expect(store.getState().isLoading).toBe(true)
      if (outcome === '예외') old.reject(new Error('이전 계정 조회 실패'))
      else old.resolve(outcome === '성공' ? list(99) : failure)
      await settledA
      expect(store.getState()).toMatchObject({ notifs: [], unreadCount: 0, isLoading: true })
      // An old finally must not detach B's pending request from deduplication.
      expect(actions.fetchInitialNotifs('2')).toBe(loadingB)
      expect(mocks.get).toHaveBeenCalledTimes(2)

      current.resolve(list(2))
      await loadingB
      expect(store.getState()).toMatchObject({
        notifs: [notif(2)],
        unreadCount: 2,
        nextCursorId: 2,
        isLoading: false,
      })
    },
  )

  it('A → B → A 전환에서 첫 A 조회는 마지막 A 결과를 덮어쓰지 않는다', async () => {
    const old = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(old.promise).mockResolvedValueOnce(list(3))
    const loadingA = actions.fetchInitialNotifs('1')
    switchAccount(2)
    switchAccount(1)
    await actions.fetchInitialNotifs('1')
    old.resolve(list(99))
    await loadingA
    expect(store.getState().notifs).toContainEqual(notif(3))
    expect(store.getState().unreadCount).toBe(3)
    expect(store.getState().notifs).not.toContainEqual(notif(99))
  })

  it('B 재연결 조회도 미완료 A 조회를 기다리지 않는다', async () => {
    const old = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(old.promise).mockResolvedValueOnce(list(2, false))
    const loadingA = actions.fetchInitialNotifs('1')
    switchAccount(2)
    const current = mount()
    const open = () =>
      current.onopen!(new Response(null, { headers: { 'content-type': 'text/event-stream' } }))
    const connect = () => current.onmessage!({ event: 'connect', data: 'connected', id: '' })
    await open()
    connect()
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.get).toHaveBeenCalledTimes(2)
    mocks.get.mockResolvedValueOnce(list(3, false))
    await open()
    connect()
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.get).toHaveBeenCalledTimes(3)
    old.resolve(list(99))
    await loadingA
    expect(store.getState().notifs).toEqual([notif(3), notif(2)])
  })

  it('같은 계정의 여러 구독은 하나의 조회·연결을 공유하고 전환 시 한 번만 초기화한다', async () => {
    const current = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValue(current.promise)
    mount()
    mount()
    expect(mocks.get).toHaveBeenCalledTimes(1)
    expect(mocks.source).toHaveBeenCalledTimes(1)
    const reset = vi.spyOn(store.getState(), 'resetNotifs')
    switchAccount(2)
    mount()
    mount()
    expect(reset).toHaveBeenCalledTimes(1)
    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(mocks.source).toHaveBeenCalledTimes(2)
    current.resolve(list(2))
    await vi.advanceTimersByTimeAsync(0)
    expect(store.getState().notifs).toEqual([notif(2)])
  })

  it('같은 사용자의 프로필 갱신은 진행 중인 조회·연결을 초기화하지 않는다', async () => {
    const current = mount()
    await vi.advanceTimersByTimeAsync(0)
    switchAccount(1)
    expect(current.signal?.aborted).toBe(false)
    expect(store.getState().notifs).toEqual([notif(1)])
  })

  it('이전 계정 재동기화 완료가 새 계정의 배지 재시도 타이머를 취소하지 않는다', async () => {
    await actions.fetchInitialNotifs('1')
    const old = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(old.promise)
    await actions.markAsRead(1)
    await vi.advanceTimersByTimeAsync(0)

    switchAccount(2)
    mocks.get.mockResolvedValueOnce(list(2))
    await actions.fetchInitialNotifs('2')
    mocks.get.mockResolvedValueOnce(failure)
    await actions.markAsRead(2)
    await vi.advanceTimersByTimeAsync(0)
    const requestsBeforeRetry = mocks.get.mock.calls.length

    old.resolve(list(99))
    await vi.advanceTimersByTimeAsync(0)
    mocks.get.mockResolvedValueOnce(list(3))
    await vi.advanceTimersByTimeAsync(1000)
    expect(mocks.get).toHaveBeenCalledTimes(requestsBeforeRetry + 1)
    expect(store.getState().notifs).toContainEqual(notif(3))
    expect(store.getState().unreadCount).toBe(3)
    expect(store.getState().notifs).not.toContainEqual(notif(99))
  })

  it('401 응답 본문 정리 중 계정이 바뀌면 새 계정의 인증 콜백을 호출하지 않는다', async () => {
    const body = deferred<void>()
    const old = mount()
    const opening = old.onopen!(
      new Response(new ReadableStream({ cancel: () => body.promise }), {
        status: 401,
      }),
    )
    switchAccount(2)
    const current = mount()
    body.resolve()
    await opening
    expect(mocks.refresh).not.toHaveBeenCalled()
    expect(current.signal?.aborted).toBe(false)
    receive(current, 20)
    expect(store.getState().notifs).toContainEqual(notif(20))
  })

  it.each(['invalid', 'refreshed', 'unavailable', '예외'] as const)(
    'A 인증 갱신의 늦은 %s 결과는 B 연결·로그인·목록을 유지한다',
    async (status) => {
      const refresh = deferred<{ status: string }>()
      mocks.refresh.mockReturnValueOnce(refresh.promise)
      const old = mount()
      const opening = old.onopen!(new Response(null, { status: 401 }))
      // Attach rejection handling before completing the delayed refresh.
      const settled = Promise.resolve(opening).then(
        () => '완료',
        () => '예외',
      )
      await vi.advanceTimersByTimeAsync(0)
      expect(mocks.refresh).toHaveBeenCalledTimes(1)

      // Deliberately leave A's effect active: auth changes before effect cleanup.
      switchAccount(2)
      mocks.get.mockResolvedValueOnce(list(2))
      const current = mount()
      await vi.advanceTimersByTimeAsync(0)
      if (status === '예외') refresh.reject(new Error('이전 인증 갱신 실패'))
      else refresh.resolve({ status })
      expect(await settled).toBe('완료')
      expect(old.signal?.aborted).toBe(true)
      expect(current.signal?.aborted).toBe(false)
      expect(auth.getState()).toMatchObject({ user: { id: 2 }, isLoggedIn: true })
      expect(mocks.logout).not.toHaveBeenCalled()
      expect(mocks.redirect).not.toHaveBeenCalled()
      expect(store.getState()).toMatchObject({ notifs: [notif(2)], unreadCount: 2 })
      receive(old, 99)
      receive(current, 20)
      expect(store.getState().notifs.map((item) => item.notifId)).toEqual([20, 2])
    },
  )

  it('A → B → A 전환 후 이전 A 인증 실패도 현재 A를 로그아웃시키지 않는다', async () => {
    const refresh = deferred<{ status: 'invalid' }>()
    mocks.refresh.mockReturnValueOnce(refresh.promise)
    const old = mount()
    const opening = old.onopen!(new Response(null, { status: 401 }))
    await vi.advanceTimersByTimeAsync(0)
    switchAccount(2)
    switchAccount(1)
    const current = mount()
    refresh.resolve({ status: 'invalid' })
    await opening
    expect(current.signal?.aborted).toBe(false)
    expect(mocks.logout).not.toHaveBeenCalled()
    expect(mocks.redirect).not.toHaveBeenCalled()
  })

  it('로그아웃 뒤 완료된 인증 갱신은 재연결·리다이렉트하지 않는다', async () => {
    const refresh = deferred<{ status: 'invalid' }>()
    mocks.refresh.mockReturnValueOnce(refresh.promise)
    const old = mount()
    const opening = old.onopen!(new Response(null, { status: 401 }))
    await vi.advanceTimersByTimeAsync(0)
    switchAccount(null)
    refresh.resolve({ status: 'invalid' })
    await opening
    expect(old.signal?.aborted).toBe(true)
    expect(mocks.source).toHaveBeenCalledTimes(1)
    expect(mocks.logout).not.toHaveBeenCalled()
    expect(mocks.redirect).not.toHaveBeenCalled()
    expect(store.getState()).toMatchObject({ notifs: [], unreadCount: 0, isLoading: false })
  })

  it('이전 전송 작업의 늦은 catch·finally가 새 연결 참조를 해제하지 않는다', async () => {
    const transport = deferred<void>()
    mocks.source.mockReturnValueOnce(transport.promise)
    mount()
    switchAccount(2)
    const current = mount()
    transport.reject(new Error('이전 전송 종료'))
    await vi.advanceTimersByTimeAsync(0)
    mount()
    expect(mocks.source).toHaveBeenCalledTimes(2)
    expect(current.signal?.aborted).toBe(false)
    receive(current, 20)
    expect(store.getState().notifs).toContainEqual(notif(20))
  })

  it('현재 연결의 확정된 인증 실패는 계속 로그아웃·리다이렉트한다', async () => {
    mocks.refresh.mockResolvedValueOnce({ status: 'invalid' })
    const current = mount()
    await current.onopen!(new Response(null, { status: 401 }))
    expect(current.signal?.aborted).toBe(true)
    expect(mocks.logout).toHaveBeenCalledTimes(1)
    expect(mocks.redirect).toHaveBeenCalledWith('/api/auth/logout?redirectTo=/signin')
    expect(auth.getState()).toMatchObject({ user: null, isLoggedIn: false })
  })
})
