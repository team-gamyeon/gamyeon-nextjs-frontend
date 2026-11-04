import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchEventSourceInit } from '@microsoft/fetch-event-source'
import type { ApiResponse } from '@/shared/lib/api'
import type { Notif, NotifListData } from '@/featured/notif/types'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  source: vi.fn(),
  auth: {
    isLoggedIn: true,
    user: { id: 1 } as { id: number } | null,
    logout: vi.fn(),
  },
  cleanups: [] as (() => void)[],
}))

// Exercise the real subscription, actions and store with controlled REST/SSE timing.
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

vi.mock('@/featured/auth/store', () => ({
  useAuthStore: Object.assign(
    (selector: (state: typeof mocks.auth) => unknown) => selector(mocks.auth),
    { getState: () => mocks.auth, subscribe: vi.fn() },
  ),
}))

vi.mock('@/featured/auth/actions/auth.action', () => ({ refreshAuthSession: vi.fn() }))
vi.mock('@microsoft/fetch-event-source', () => ({
  EventStreamContentType: 'text/event-stream',
  fetchEventSource: mocks.source,
}))
vi.mock('@/featured/notif/actions/notif.action', () => ({
  getNotifsAction: mocks.get,
  markNotifAsReadAction: vi.fn(),
  markAllNotifsAsReadAction: vi.fn(),
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function notif(notifId: number): Notif {
  return {
    notifId,
    notifType: 'NOTICE',
    title: '알림',
    content: '내용',
    targetId: notifId,
    isRead: false,
    createdAt: new Date(1700000000000 + notifId * 1000).toISOString(),
  }
}

function list(
  ids: number[],
  hasNext = false,
  unreadCount = ids.length,
): ApiResponse<NotifListData> {
  return {
    success: true,
    code: 'OK',
    message: '',
    data: {
      notifs: ids.map(notif),
      unreadCount,
      hasNext,
      nextCursorId: ids.at(-1) ?? null,
    },
  }
}

const failure = { success: false, code: 'FAILED', message: '조회 실패', data: null }
let store: typeof import('@/featured/notif/store').useNotifStore
let actionsModule: typeof import('@/featured/notif/hooks/useNotifActions')

beforeEach(async () => {
  vi.useFakeTimers()
  vi.resetModules()
  vi.resetAllMocks()
  vi.stubGlobal('window', {})
  vi.stubGlobal('document', {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  mocks.auth.isLoggedIn = true
  mocks.auth.user = { id: 1 }
  mocks.cleanups = []
  mocks.get.mockResolvedValue(list([1]))
  mocks.source.mockImplementation(() => new Promise(() => {}))
  store = (await import('@/featured/notif/store')).useNotifStore
  actionsModule = await import('@/featured/notif/hooks/useNotifActions')
})

afterEach(() => {
  mocks.cleanups.forEach((cleanup) => cleanup())
  actionsModule.invalidateNotifSession()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

function ids() {
  return store.getState().notifs.map((item) => item.notifId)
}

async function open(stream: FetchEventSourceInit) {
  await stream.onopen!(new Response(null, { headers: { 'content-type': 'text/event-stream' } }))
}

function connect(stream: FetchEventSourceInit) {
  stream.onmessage!({ event: 'connect', data: 'connected', id: '' })
}

async function mount() {
  const { useNotifSubscription: subscribe } =
    await import('@/featured/notif/hooks/useNotifSubscription')
  subscribe()
  return mocks.source.mock.calls[0][1] as FetchEventSourceInit
}

describe('main과 동일한 SSE 목록 조회', () => {
  it.each(['진행 중', '완료'] as const)(
    '최초 조회가 %s이어도 첫 연결과 중복 connect는 추가 조회하지 않는다',
    async (state) => {
      const initial = deferred<ApiResponse<NotifListData>>()
      mocks.get.mockReturnValueOnce(initial.promise)
      const stream = await mount()
      if (state === '완료') {
        initial.resolve(list([1]))
        await vi.advanceTimersByTimeAsync(0)
      }

      await open(stream)
      connect(stream)
      connect(stream)
      if (state === '진행 중') initial.resolve(list([1]))
      await vi.advanceTimersByTimeAsync(0)
      expect(mocks.get).toHaveBeenCalledTimes(1)
      expect(ids()).toEqual([1])

      mocks.get.mockResolvedValueOnce(list([2, 1]))
      await open(stream)
      connect(stream)
      connect(stream)
      await vi.advanceTimersByTimeAsync(0)
      expect(mocks.get).toHaveBeenCalledTimes(2)
      expect(ids()).toEqual([2, 1])
    },
  )

  it('재연결은 최신 첫 페이지만 조회하고 과거 페이지를 자동 복구하지 않는다', async () => {
    const stream = await mount()
    await open(stream)
    connect(stream)
    await vi.advanceTimersByTimeAsync(0)
    mocks.get.mockClear()
    mocks.get.mockResolvedValueOnce(list([8, 7, 6, 5, 4], true, 8))

    await open(stream)
    connect(stream)
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.get.mock.calls).toEqual([[]])
    expect(ids()).toEqual([8, 7, 6, 5, 4, 1])
    expect(store.getState()).toMatchObject({ unreadCount: 8, hasMore: true, nextCursorId: 4 })
  })

  it('최초 조회 도중 재연결되면 진행 중인 요청을 공유한다', async () => {
    const initial = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(initial.promise)
    const stream = await mount()
    await open(stream)
    connect(stream)
    await open(stream)
    connect(stream)
    expect(mocks.get).toHaveBeenCalledTimes(1)

    initial.resolve(list([1]))
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.get).toHaveBeenCalledTimes(1)
    expect(ids()).toEqual([1])
  })

  it('재연결 조회 도중 다시 연결되어도 진행 중인 요청을 공유한다', async () => {
    const stream = await mount()
    await open(stream)
    connect(stream)
    await vi.advanceTimersByTimeAsync(0)
    const pending = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(pending.promise)

    await open(stream)
    connect(stream)
    await open(stream)
    connect(stream)
    expect(mocks.get).toHaveBeenCalledTimes(2)
    pending.resolve(list([2, 1]))
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(ids()).toEqual([2, 1])
  })

  it.each(['실패 응답', '네트워크 오류'] as const)(
    '최초 조회가 %s이면 자동 재시도하지 않고 다음 재연결에서 조회한다',
    async (kind) => {
      if (kind === '실패 응답') mocks.get.mockResolvedValueOnce(failure)
      else mocks.get.mockRejectedValueOnce(new Error('네트워크 오류'))
      const stream = await mount()
      await open(stream)
      connect(stream)
      await vi.advanceTimersByTimeAsync(60000)
      expect(mocks.get).toHaveBeenCalledTimes(1)
      expect(ids()).toEqual([])
      expect(store.getState().isLoading).toBe(false)
      expect(console.error).toHaveBeenCalledWith(
        '알림 목록을 불러오지 못했습니다.',
        expect.any(Error),
      )

      mocks.get.mockResolvedValueOnce(list([2, 1]))
      await open(stream)
      connect(stream)
      await vi.advanceTimersByTimeAsync(0)
      expect(mocks.get).toHaveBeenCalledTimes(2)
      expect(ids()).toEqual([2, 1])
    },
  )

  it('재연결 조회가 실패해도 자동 재시도하지 않고 기존 목록을 유지한다', async () => {
    const stream = await mount()
    await open(stream)
    connect(stream)
    await vi.advanceTimersByTimeAsync(0)
    mocks.get.mockResolvedValueOnce(failure)
    await open(stream)
    connect(stream)
    await vi.advanceTimersByTimeAsync(60000)
    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(ids()).toEqual([1])
    expect(store.getState()).toMatchObject({ unreadCount: 1, isLoading: false })
  })

  it('여러 구독자는 최초 조회, SSE 연결과 재연결 조회를 공유한다', async () => {
    const initial = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(initial.promise)
    const stream = await mount()
    await mount()
    expect(mocks.source).toHaveBeenCalledTimes(1)
    expect(mocks.get).toHaveBeenCalledTimes(1)
    await open(stream)
    connect(stream)
    initial.resolve(list([1]))
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.get).toHaveBeenCalledTimes(1)

    mocks.get.mockResolvedValueOnce(list([2, 1]))
    await open(stream)
    connect(stream)
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(ids()).toEqual([2, 1])
  })

  it('조회 중 새 SSE 알림이 오면 오래된 배지를 적용하지 않고 다시 조회한다', async () => {
    const initial = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(initial.promise).mockResolvedValueOnce(list([2, 1]))
    const stream = await mount()
    await open(stream)
    connect(stream)
    stream.onmessage!({ event: 'notif', data: JSON.stringify(notif(2)), id: '' })
    initial.resolve(list([1]))
    await vi.advanceTimersByTimeAsync(0)
    expect(ids()).toEqual([2])
    expect(store.getState().unreadCount).toBe(1)
    await vi.advanceTimersByTimeAsync(250)
    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(ids()).toEqual([2, 1])
    expect(store.getState().unreadCount).toBe(2)
  })

  it('마지막 구독 해제는 유예 후 SSE 연결을 종료한다', async () => {
    const stream = await mount()
    await open(stream)
    connect(stream)
    await vi.advanceTimersByTimeAsync(0)
    mocks.cleanups.pop()!()
    await vi.advanceTimersByTimeAsync(299)
    expect(stream.signal?.aborted).toBe(false)
    await vi.advanceTimersByTimeAsync(1)
    expect(stream.signal?.aborted).toBe(true)
    await vi.advanceTimersByTimeAsync(60000)
    expect(mocks.get).toHaveBeenCalledTimes(1)
  })
})
