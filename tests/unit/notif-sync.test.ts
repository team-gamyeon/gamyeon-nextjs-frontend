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
let actions: ReturnType<typeof actionsModule.useNotifActions>

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
  actions = actionsModule.useNotifActions()
})

afterEach(() => {
  mocks.cleanups.forEach((cleanup) => cleanup())
  actionsModule.invalidateNotifSession()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

async function seed(ids = [1], hasNext = false) {
  mocks.get.mockResolvedValueOnce(list(ids, hasNext))
  await actions.fetchInitialNotifs('1')
  mocks.get.mockClear()
}

function ids() {
  return store.getState().notifs.map((item) => item.notifId)
}

describe('SSE 연결 후 알림 누락 보정', () => {
  it('최초 연결과 재연결 모두 새 조회를 수행하고 중복 connect는 무시한다', async () => {
    const initial = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(initial.promise).mockResolvedValueOnce(list([2, 1]))
    const { useNotifSubscription } = await import('@/featured/notif/hooks/useNotifSubscription')
    useNotifSubscription()
    const stream = mocks.source.mock.calls[0][1] as FetchEventSourceInit
    const open = () =>
      stream.onopen!(new Response(null, { headers: { 'content-type': 'text/event-stream' } }))
    const connect = () => stream.onmessage!({ event: 'connect', data: 'connected', id: '' })

    await open()
    connect()
    expect(mocks.get).toHaveBeenCalledTimes(1)
    initial.resolve(list([1]))
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(ids()).toEqual([2, 1])

    connect()
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.get).toHaveBeenCalledTimes(2)

    mocks.get.mockResolvedValueOnce(list([3, 2, 1]))
    await open()
    connect()
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.get).toHaveBeenCalledTimes(3)
    expect(ids()).toEqual([3, 2, 1])
  })

  it('연결 전 조회가 실패해도 새 조회로 복구한다', async () => {
    const initial = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(initial.promise).mockResolvedValueOnce(list([2, 1]))
    const loading = actions.fetchInitialNotifs('1')
    const rejected = expect(loading).rejects.toThrow('조회 실패')
    const syncing = actions.resyncNotifs('1')
    initial.resolve(failure)
    await rejected
    await syncing

    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(ids()).toEqual([2, 1])
  })

  it('7건 누락이면 다음 페이지에서 기존 알림을 찾을 때까지 복구한다', async () => {
    await seed([3, 2, 1], true)
    mocks.get
      .mockResolvedValueOnce(list([10, 9, 8, 7, 6], true, 10))
      .mockResolvedValueOnce(list([5, 4, 3, 2, 1], false, 10))

    await actions.resyncNotifs('1')

    expect(mocks.get.mock.calls).toEqual([[], [{ cursorId: 6 }]])
    expect(ids()).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(store.getState()).toMatchObject({ unreadCount: 10, hasMore: false, isLoading: false })
  })

  it('여러 페이지를 복구한 뒤 남은 과거 목록은 더 보기로 조회할 수 있다', async () => {
    await seed([5, 4, 3, 2, 1], true)
    mocks.get
      .mockResolvedValueOnce(list([12, 11, 10, 9, 8], true, 12))
      .mockResolvedValueOnce(list([7, 6, 5, 4, 3], true, 12))

    await actions.resyncNotifs('1')

    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(ids()).toEqual([12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(store.getState()).toMatchObject({ nextCursorId: 3, hasMore: true })
    mocks.get.mockResolvedValueOnce(list([2, 1], false, 12))
    await actions.fetchMoreNotifs()
    expect(mocks.get).toHaveBeenLastCalledWith({ cursorId: 3 })
    expect(new Set(ids()).size).toBe(12)
  })

  it('복구 기준이 없거나 기존 알림이 사라졌으면 마지막 페이지까지 조회한다', async () => {
    mocks.get
      .mockResolvedValueOnce(list([8, 7, 6, 5, 4], true, 8))
      .mockResolvedValueOnce(list([3, 2, 1], false, 8))
    await actions.resyncNotifs('1')
    expect(ids()).toEqual([8, 7, 6, 5, 4, 3, 2, 1])

    // A deleted anchor must not prevent restoration of the remaining server pages.
    mocks.get.mockClear()
    mocks.get
      .mockResolvedValueOnce(list([15, 14, 13, 12, 11], true, 7))
      .mockResolvedValueOnce(list([10, 9], false, 7))
    await actions.resyncNotifs('1')
    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(ids()).toContain(9)
  })

  it('재연결 직후 받은 SSE 알림에서 멈추지 않고 이전 복구 기준까지 조회한다', async () => {
    await seed()
    actions.receiveNotif(notif(8))
    mocks.get
      .mockResolvedValueOnce(list([8, 7, 6, 5, 4], true, 8))
      .mockResolvedValueOnce(list([3, 2, 1], false, 8))

    await actions.resyncNotifs('1')

    expect(ids()).toEqual([8, 7, 6, 5, 4, 3, 2, 1])
    expect(store.getState().unreadCount).toBe(8)
  })

  it.each(['실패 응답', '네트워크 오류'] as const)('%s이면 1초 후 재시도한다', async (kind) => {
    await seed()
    if (kind === '실패 응답') mocks.get.mockResolvedValueOnce(failure)
    else mocks.get.mockRejectedValueOnce(new Error('네트워크 오류'))
    mocks.get.mockResolvedValueOnce(list([2, 1]))
    const syncing = actions.resyncNotifs('1')
    await vi.advanceTimersByTimeAsync(999)
    expect(mocks.get).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    await syncing
    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(ids()).toEqual([2, 1])
  })

  it('연속 실패는 1·2·4·8·16·30초 간격으로 재시도하고 성공 후 멈춘다', async () => {
    await seed()
    mocks.get.mockResolvedValue(failure)
    const syncing = actions.resyncNotifs('1')
    await vi.advanceTimersByTimeAsync(0)
    let count = 1
    for (const delay of [1000, 2000, 4000, 8000, 16000, 30000, 30000]) {
      await vi.advanceTimersByTimeAsync(delay - 1)
      expect(mocks.get).toHaveBeenCalledTimes(count)
      await vi.advanceTimersByTimeAsync(1)
      expect(mocks.get).toHaveBeenCalledTimes(++count)
    }
    mocks.get.mockResolvedValueOnce(list([2, 1]))
    await vi.advanceTimersByTimeAsync(30000)
    await syncing
    const calls = mocks.get.mock.calls.length
    await vi.advanceTimersByTimeAsync(60000)
    expect(mocks.get).toHaveBeenCalledTimes(calls)
  })

  it('중간 페이지 실패 시 일부만 반영하지 않고 같은 누락 구간을 다시 복구한다', async () => {
    await seed()
    mocks.get
      .mockResolvedValueOnce(list([8, 7, 6, 5, 4], true, 8))
      .mockResolvedValueOnce(failure)
      .mockResolvedValueOnce(list([9, 8, 7, 6, 5], true, 9))
      .mockResolvedValueOnce(list([4, 3, 2, 1], false, 9))
    const syncing = actions.resyncNotifs('1')
    await vi.advanceTimersByTimeAsync(0)
    expect(ids()).toEqual([1])
    actions.receiveNotif(notif(9))
    await vi.advanceTimersByTimeAsync(1000)
    await syncing

    expect(mocks.get.mock.calls).toEqual([[], [{ cursorId: 4 }], [], [{ cursorId: 5 }]])
    expect(ids()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(store.getState().unreadCount).toBe(9)
  })

  it('복구 도중 재연결되면 진행 중인 결과에 이어 새 조회를 수행한다', async () => {
    await seed()
    const old = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(old.promise).mockResolvedValueOnce(list([3, 2, 1]))
    const first = actions.resyncNotifs('1')
    await vi.advanceTimersByTimeAsync(0)
    const second = actions.resyncNotifs('1')
    old.resolve(list([2, 1]))
    await Promise.all([first, second])

    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(ids()).toEqual([3, 2, 1])
  })

  it('같은 연결 이벤트의 여러 구독자 요청은 하나의 조회로 합친다', async () => {
    await seed()
    mocks.get.mockResolvedValueOnce(list([2, 1]))
    const first = actions.resyncNotifs('1')
    const second = actionsModule.useNotifActions().resyncNotifs('1')
    await Promise.all([first, second])
    expect(mocks.get).toHaveBeenCalledTimes(1)
    expect(ids()).toEqual([2, 1])
  })

  it('초기 조회 중 SSE가 도착해도 최초 스냅샷을 기준으로 5건 초과 누락을 복구한다', async () => {
    const initial = deferred<ApiResponse<NotifListData>>()
    mocks.get
      .mockReturnValueOnce(initial.promise)
      .mockResolvedValueOnce(list([9, 8, 7, 6, 5], true, 9))
      .mockResolvedValueOnce(list([9, 8, 7, 6, 5], true, 9))
      .mockResolvedValueOnce(list([4, 3, 2, 1], false, 9))
    const loading = actions.fetchInitialNotifs('1')
    const syncing = actions.resyncNotifs('1')
    actions.receiveNotif(notif(9))
    initial.resolve(list([1]))
    await vi.advanceTimersByTimeAsync(250)
    await Promise.all([loading, syncing])

    expect(mocks.get).toHaveBeenCalledTimes(4)
    expect(ids()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(store.getState().unreadCount).toBe(9)
  })

  it('재시도 대기 중 재연결되면 타이머를 기다리지 않고 바로 조회한다', async () => {
    await seed()
    mocks.get.mockResolvedValueOnce(failure).mockResolvedValueOnce(list([2, 1]))
    const first = actions.resyncNotifs('1')
    await vi.advanceTimersByTimeAsync(0)
    const second = actions.resyncNotifs('1')
    await Promise.all([first, second])
    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(ids()).toEqual([2, 1])
  })

  it('페이지 조회 도중 SSE 변경이 생기면 오래된 배지를 적용하지 않고 다시 조회한다', async () => {
    await seed()
    const page = deferred<ApiResponse<NotifListData>>()
    mocks.get
      .mockResolvedValueOnce(list([8, 7, 6, 5, 4], true, 8))
      .mockReturnValueOnce(page.promise)
      .mockResolvedValueOnce(list([9, 8, 7, 6, 5], true, 9))
      .mockResolvedValueOnce(list([4, 3, 2, 1], false, 9))
    const syncing = actions.resyncNotifs('1')
    await vi.advanceTimersByTimeAsync(0)
    actions.receiveNotif(notif(9))
    page.resolve(list([3, 2, 1], false, 8))
    await vi.advanceTimersByTimeAsync(0)
    expect(ids()).toEqual([9, 1])
    await vi.advanceTimersByTimeAsync(250)
    await syncing
    expect(ids()).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1])
    expect(store.getState().unreadCount).toBe(9)
  })

  it('복구 전 시작한 더 보기 응답이 복구된 커서와 배지를 덮어쓰지 않는다', async () => {
    await seed([3], true)
    const more = deferred<ApiResponse<NotifListData>>()
    mocks.get
      .mockReturnValueOnce(more.promise)
      .mockResolvedValueOnce(list([8, 7, 6, 5, 4], true, 8))
      .mockResolvedValueOnce(list([3, 2, 1], false, 8))
    const loadingMore = actions.fetchMoreNotifs()
    await actions.resyncNotifs('1')
    more.resolve(list([2], true, 3))
    await loadingMore
    expect(store.getState()).toMatchObject({
      unreadCount: 8,
      nextCursorId: 1,
      hasMore: false,
      isLoadingMore: false,
    })
  })

  it('반복 커서는 무한 조회하지 않고 재시도한다', async () => {
    await seed()
    mocks.get
      .mockResolvedValueOnce(list([8, 7, 6, 5, 4], true))
      .mockResolvedValueOnce(list([4], true))
      .mockResolvedValueOnce(list([2, 1]))
    const syncing = actions.resyncNotifs('1')
    await vi.advanceTimersByTimeAsync(0)
    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(ids()).toEqual([1])
    await vi.advanceTimersByTimeAsync(1000)
    await syncing
    expect(ids()).toEqual([2, 1])
  })

  it.each(['로그아웃', '사용자 변경', '구독 종료'] as const)(
    '%s 시 예약된 재시도를 취소한다',
    async (reason) => {
      await seed()
      mocks.get.mockResolvedValueOnce(failure)
      const syncing = actions.resyncNotifs('1')
      await vi.advanceTimersByTimeAsync(0)
      if (reason === '구독 종료') actionsModule.cancelNotifResync()
      else {
        mocks.auth.user = reason === '로그아웃' ? null : { id: 2 }
        mocks.auth.isLoggedIn = reason !== '로그아웃'
        actionsModule.invalidateNotifSession()
        store.getState().resetNotifs()
      }
      await syncing
      await vi.advanceTimersByTimeAsync(60000)
      expect(mocks.get).toHaveBeenCalledTimes(1)
    },
  )

  it('로그아웃 뒤 도착한 페이지를 적용하거나 추가 조회하지 않는다', async () => {
    await seed()
    const page = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockResolvedValueOnce(list([8, 7, 6, 5, 4], true)).mockReturnValueOnce(page.promise)
    const syncing = actions.resyncNotifs('1')
    await vi.advanceTimersByTimeAsync(0)
    mocks.auth.isLoggedIn = false
    mocks.auth.user = null
    actionsModule.invalidateNotifSession()
    store.getState().resetNotifs()
    page.resolve(list([3, 2, 1]))
    await syncing
    expect(ids()).toEqual([])
    expect(store.getState()).toMatchObject({ unreadCount: 0, isLoading: false })
    expect(mocks.get).toHaveBeenCalledTimes(2)
  })

  it('마지막 구독 해제 후에는 복구 재시도도 종료한다', async () => {
    const { useNotifSubscription } = await import('@/featured/notif/hooks/useNotifSubscription')
    useNotifSubscription()
    await vi.advanceTimersByTimeAsync(0)
    const stream = mocks.source.mock.calls[0][1] as FetchEventSourceInit
    mocks.get.mockResolvedValueOnce(failure)
    stream.onmessage!({ event: 'connect', data: 'connected', id: '' })
    await vi.advanceTimersByTimeAsync(0)
    mocks.cleanups.pop()!()
    await vi.advanceTimersByTimeAsync(300)
    expect(stream.signal?.aborted).toBe(true)
    await vi.advanceTimersByTimeAsync(60000)
    expect(mocks.get).toHaveBeenCalledTimes(2)
  })
})
