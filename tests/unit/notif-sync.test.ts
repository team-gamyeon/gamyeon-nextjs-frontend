import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FetchEventSourceInit } from '@microsoft/fetch-event-source'
import type { ApiResponse } from '@/shared/lib/api'
import type { Notif, NotifListData } from '@/featured/notif/types'

const mocks = vi.hoisted(() => ({
  auth: { isLoggedIn: true, user: { id: 1 } as { id: number } | null, logout: vi.fn() },
  get: vi.fn(),
  read: vi.fn(),
  readAll: vi.fn(),
  refresh: vi.fn(),
  connect: vi.fn<(url: string, options: FetchEventSourceInit) => Promise<void>>(),
  cleanups: [] as (() => void)[],
}))

// Exercise the real actions/store/SSE callbacks without mounting UI. Effects are
// entered explicitly; REST promises and connection callbacks control event order.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useCallback: (callback: unknown) => callback,
  useMemo: (factory: () => unknown) => factory(),
  useRef: (current: unknown) => ({ current }),
  useEffect: (effect: () => (() => void) | undefined) => {
    const cleanup = effect()
    if (cleanup) mocks.cleanups.push(cleanup)
  },
}))

vi.mock('@/featured/auth/store', () => ({
  useAuthStore: Object.assign(
    (selector: (state: typeof mocks.auth) => unknown) => selector(mocks.auth),
    {
      getState: () => mocks.auth,
    },
  ),
}))

vi.mock('@/featured/auth/actions/auth.action', () => ({ refreshAuthSession: mocks.refresh }))
vi.mock('@/featured/notif/actions/notif.action', () => ({
  getNotifsAction: mocks.get,
  markNotifAsReadAction: mocks.read,
  markAllNotifsAsReadAction: mocks.readAll,
}))
vi.mock('@microsoft/fetch-event-source', () => ({
  EventStreamContentType: 'text/event-stream',
  fetchEventSource: mocks.connect,
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

function notif(notifId: number, overrides: Partial<Notif> = {}): Notif {
  return {
    notifId,
    notifType: 'NOTICE',
    title: '알림',
    content: '내용',
    targetId: notifId,
    isRead: false,
    createdAt: new Date(1700000000000 + notifId * 1000).toISOString(),
    ...overrides,
  }
}

function list(
  notifs: Notif[],
  unreadCount = notifs.filter((item) => !item.isRead).length,
  hasNext = false,
  nextCursorId: number | null = null,
): ApiResponse<NotifListData> {
  return {
    success: true,
    code: 'OK',
    message: '',
    data: { notifs, unreadCount, hasNext, nextCursorId },
  }
}

const success = { success: true, code: 'OK', message: '', data: null }
const failure = { success: false, code: 'FAILED', message: '요청 실패', data: null }
const flush = () => vi.advanceTimersByTimeAsync(0)

let store: typeof import('@/featured/notif/store').useNotifStore
let actions: ReturnType<typeof import('@/featured/notif/hooks/useNotifActions').useNotifActions>
let invalidate: typeof import('@/featured/notif/hooks/useNotifActions').invalidateNotifSession

beforeEach(async () => {
  vi.resetModules()
  vi.resetAllMocks()
  vi.useFakeTimers()
  mocks.auth.isLoggedIn = true
  mocks.auth.user = { id: 1 }
  mocks.cleanups.length = 0
  mocks.get.mockResolvedValue(list([]))
  mocks.read.mockResolvedValue(success)
  mocks.readAll.mockResolvedValue(success)
  mocks.refresh.mockResolvedValue({ status: 'refreshed' })
  mocks.connect.mockImplementation(() => new Promise(() => {}))
  vi.stubGlobal('window', { location: { replace: vi.fn() } })
  vi.stubGlobal('document', {})
  store = (await import('@/featured/notif/store')).useNotifStore
  const notifActionsModule = await import('@/featured/notif/hooks/useNotifActions')
  invalidate = notifActionsModule.invalidateNotifSession
  actions = notifActionsModule.useNotifActions()
})

afterEach(() => {
  for (const cleanup of mocks.cleanups) cleanup()
  invalidate()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('REST/SSE/읽음 처리의 응답 순서', () => {
  it('조회 중 SSE가 도착하면 과거 응답을 보류하고 재조회한다', async () => {
    const first = deferred<ApiResponse<NotifListData>>()
    const second = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const loading = actions.fetchInitialNotifs('1')
    actions.receiveNotif(notif(2))
    first.resolve(list([notif(1)], 1))
    await flush()
    expect(store.getState().notifs.map((item) => item.notifId)).toEqual([2])
    await vi.advanceTimersByTimeAsync(250)
    expect(mocks.get).toHaveBeenCalledTimes(2)
    second.resolve(list([notif(2), notif(1)], 2))
    await loading
    expect(store.getState().notifs.map((item) => item.notifId)).toEqual([2, 1])
    expect(store.getState().unreadCount).toBe(2)
  })

  it('같은 알림의 SSE 재수신은 목록과 배지를 중복 증가시키지 않는다', () => {
    actions.receiveNotif(notif(1))
    actions.receiveNotif(notif(1))
    expect(store.getState().notifs).toHaveLength(1)
    expect(store.getState().unreadCount).toBe(1)
  })

  it('개별 읽음은 즉시 반영하고 완료 후 서버 카운트로 맞춘다', async () => {
    actions.receiveNotif(notif(1))
    const read = deferred<typeof success>()
    mocks.read.mockReturnValueOnce(read.promise)
    mocks.get.mockResolvedValue(list([notif(1, { isRead: true })], 0))
    const reading = actions.markAsRead(1)
    expect(store.getState().notifs[0].isRead).toBe(true)
    expect(store.getState().unreadCount).toBe(0)
    read.resolve(success)
    await reading
    await flush()
    expect(mocks.get).toHaveBeenCalledTimes(1)
    expect(store.getState().unreadCount).toBe(0)
  })

  it('읽음 요청 실패 시 중간에 수신한 SSE를 유지하며 복구한다', async () => {
    actions.receiveNotif(notif(1))
    const read = deferred<typeof failure>()
    mocks.read.mockReturnValueOnce(read.promise)
    mocks.get.mockResolvedValue(list([notif(2), notif(1)], 2))
    const reading = actions.markAsRead(1)
    const rejected = expect(reading).rejects.toThrow('요청 실패')
    actions.receiveNotif(notif(2))
    read.resolve(failure)
    await rejected
    await flush()
    expect(store.getState().notifs.map((item) => item.notifId)).toEqual([2, 1])
    expect(store.getState().notifs.every((item) => !item.isRead)).toBe(true)
    expect(store.getState().unreadCount).toBe(2)
  })

  it('읽음 진행 중 시작한 조회로 배지를 이중 차감하지 않는다', async () => {
    actions.receiveNotif(notif(1))
    actions.receiveNotif(notif(2))
    const read = deferred<typeof success>()
    mocks.read.mockReturnValueOnce(read.promise)
    const reading = actions.markAsRead(1)
    mocks.get.mockResolvedValueOnce(list([notif(2)], 1))
    await actions.fetchInitialNotifs('1')
    expect(store.getState().unreadCount).toBe(1)
    expect(store.getState().notifs.find((item) => item.notifId === 1)?.isRead).toBe(true)
    mocks.get.mockResolvedValue(list([notif(2), notif(1, { isRead: true })], 1))
    read.resolve(success)
    await reading
    await flush()
    expect(store.getState().unreadCount).toBe(1)
  })

  it('분석 중 알림도 중복 읽음 요청을 보내지 않는다', async () => {
    actions.receiveNotif(notif(1, { notifType: 'REPORT_PROCESSING' }))
    const read = deferred<typeof success>()
    mocks.read.mockReturnValue(read.promise)
    const one = actions.markProcessingAsRead(1)
    const two = actions.markProcessingAsRead(1)
    expect(mocks.read).toHaveBeenCalledTimes(1)
    read.resolve(success)
    await Promise.all([one, two])
  })

  it('분석 중 알림이 조회 페이지 밖에 있어도 읽음 카운트를 이중 차감하지 않는다', async () => {
    actions.receiveNotif(notif(1, { notifType: 'REPORT_PROCESSING' }))
    actions.receiveNotif(notif(2))
    const read = deferred<typeof success>()
    mocks.read.mockReturnValueOnce(read.promise)
    const reading = actions.markProcessingAsRead(1)
    // 서버는 1번을 읽음 처리했지만 응답에는 최신 페이지의 2번만 포함한다.
    mocks.get.mockResolvedValue(list([notif(2)], 1))
    await actions.fetchInitialNotifs('1')
    read.resolve(success)
    await reading
    await flush()
    expect(store.getState().unreadCount).toBe(1)
    expect(store.getState().notifs.find((item) => item.notifId === 1)?.isRead).toBe(true)
  })

  it('분석 완료 후 개별 읽음이 실패해도 분석 중 알림을 되살리지 않는다', async () => {
    actions.receiveNotif(notif(1, { notifType: 'REPORT_PROCESSING', targetId: 10 }))
    const read = deferred<typeof failure>()
    mocks.read.mockReturnValueOnce(read.promise)
    const reading = actions.markProcessingAsRead(1)
    const rejected = expect(reading).rejects.toThrow('요청 실패')
    const terminal = notif(2, { notifType: 'REPORT_SUCCESS', targetId: 10 })
    actions.receiveNotif(terminal)
    mocks.get.mockResolvedValue(list([terminal], 1))
    read.resolve(failure)
    await rejected
    await flush()
    expect(store.getState().notifs.map((item) => item.notifId)).toEqual([2])
    expect(store.getState().unreadCount).toBe(1)
    expect(mocks.read).toHaveBeenCalledTimes(2)
  })

  it('모두 읽음 실패 시 요청 중 도착한 알림까지 유지한다', async () => {
    actions.receiveNotif(notif(1))
    const readAll = deferred<typeof failure>()
    mocks.readAll.mockReturnValueOnce(readAll.promise)
    const reading = actions.markAllAsRead()
    const rejected = expect(reading).rejects.toThrow('요청 실패')
    actions.receiveNotif(notif(2))
    mocks.get.mockResolvedValue(list([notif(2), notif(1)], 2))
    readAll.resolve(failure)
    await rejected
    await flush()
    expect(store.getState().unreadCount).toBe(2)
    expect(store.getState().notifs.every((item) => !item.isRead)).toBe(true)
  })

  it('모두 읽음 성공 후 새로 도착한 알림은 서버 재조회로 확인한다', async () => {
    actions.receiveNotif(notif(1))
    const readAll = deferred<typeof success>()
    mocks.readAll.mockReturnValueOnce(readAll.promise)
    const reading = actions.markAllAsRead()
    actions.receiveNotif(notif(2))
    mocks.get.mockResolvedValue(list([notif(2), notif(1, { isRead: true })], 1))
    readAll.resolve(success)
    await reading
    await flush()
    expect(store.getState().unreadCount).toBe(1)
    expect(store.getState().notifs[0].isRead).toBe(false)
  })

  it('분석 완료 후 모두 읽음이 실패하면 숨긴 분석 중 알림의 읽음을 동기화한다', async () => {
    actions.receiveNotif(notif(1, { notifType: 'REPORT_PROCESSING', targetId: 10 }))
    const readAll = deferred<typeof failure>()
    mocks.readAll.mockReturnValueOnce(readAll.promise)
    const reading = actions.markAllAsRead()
    const rejected = expect(reading).rejects.toThrow('요청 실패')
    const terminal = notif(2, { notifType: 'REPORT_SUCCESS', targetId: 10 })
    actions.receiveNotif(terminal)
    // 숨겨진 과거 알림은 최신 페이지에 없지만 서버 전역 카운트에는 포함된다.
    mocks.get.mockImplementation(() =>
      Promise.resolve(list([terminal], mocks.read.mock.calls.length ? 1 : 2)),
    )
    readAll.resolve(failure)
    await rejected
    await flush()
    expect(mocks.read).toHaveBeenCalledWith(1)
    expect(store.getState().notifs.map((item) => item.notifId)).toEqual([2])
    expect(store.getState().unreadCount).toBe(1)
  })

  it('더 보기 중 SSE가 오면 과거 응답으로 커서나 배지를 덮어쓰지 않는다', async () => {
    store.getState().applyInitialNotifs(list([notif(3)], 3, true, 3).data!)
    const more = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(more.promise)
    const loading = actions.fetchMoreNotifs()
    actions.receiveNotif(notif(4))
    more.resolve(list([notif(2), notif(1)], 3))
    await loading
    expect(store.getState().unreadCount).toBe(4)
    expect(store.getState().nextCursorId).toBe(3)
    expect(store.getState().isLoadingMore).toBe(false)
  })

  it('더 보기보다 나중에 시작한 최신 조회 결과를 과거 페이지 응답으로 덮어쓰지 않는다', async () => {
    store.getState().applyInitialNotifs(list([notif(3)], 3, true, 3).data!)
    const more = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(more.promise)
    const loadingMore = actions.fetchMoreNotifs()
    mocks.get.mockResolvedValueOnce(list([notif(3, { isRead: true })], 0, true, 3))
    await actions.fetchInitialNotifs('1')
    more.resolve(list([notif(2), notif(1)], 3))
    await loadingMore
    expect(store.getState().unreadCount).toBe(0)
    expect(store.getState().notifs.map((item) => item.notifId)).toEqual([3])
    expect(store.getState().hasMore).toBe(true)
  })

  it('여러 읽음 요청이 모두 끝난 뒤 한 번 재동기화한다', async () => {
    actions.receiveNotif(notif(1))
    actions.receiveNotif(notif(2))
    const first = deferred<typeof success>()
    const second = deferred<typeof success>()
    mocks.read.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    mocks.get.mockResolvedValue(list([notif(2, { isRead: true }), notif(1, { isRead: true })], 0))
    const one = actions.markAsRead(1)
    const two = actions.markAsRead(2)
    first.resolve(success)
    await one
    expect(mocks.get).not.toHaveBeenCalled()
    second.resolve(success)
    await two
    await flush()
    expect(mocks.get).toHaveBeenCalledTimes(1)
    expect(store.getState().unreadCount).toBe(0)
  })

  it('읽음 후 배지 재조회가 실패하면 재시도해 서버 값으로 맞춘다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    actions.receiveNotif(notif(1))
    mocks.get
      .mockResolvedValueOnce(failure)
      .mockResolvedValueOnce(list([notif(1, { isRead: true })], 3))
    await actions.markAsRead(1)
    await flush()
    expect(mocks.get).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1000)
    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(store.getState().unreadCount).toBe(3)
  })

  it('숨긴 분석 중 알림의 읽음이 실패해도 재시도하며 배지를 중복 차감하지 않는다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    actions.receiveNotif(notif(1, { notifType: 'REPORT_PROCESSING', targetId: 10 }))
    mocks.read.mockResolvedValueOnce(failure).mockResolvedValueOnce(success)
    const terminal = notif(2, { notifType: 'REPORT_SUCCESS', targetId: 10 })
    mocks.get.mockResolvedValue(list([terminal], 1))
    actions.receiveNotif(terminal)
    await flush()
    expect(store.getState().unreadCount).toBe(1)
    expect(store.getState().unsyncedSuppressedNotifIds.has(1)).toBe(true)
    await vi.advanceTimersByTimeAsync(1000)
    expect(mocks.read).toHaveBeenCalledTimes(2)
    expect(store.getState().unsyncedSuppressedNotifIds.size).toBe(0)
    expect(store.getState().unreadCount).toBe(1)
  })
})

describe('인증 세션 경계', () => {
  it('이전 사용자의 미완료 조회가 새 사용자의 조회를 막지 않는다', async () => {
    const old = deferred<ApiResponse<NotifListData>>()
    const current = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(old.promise).mockReturnValueOnce(current.promise)
    const oldLoading = actions.fetchInitialNotifs('1')
    invalidate()
    store.getState().resetNotifs()
    mocks.auth.user = { id: 2 }
    const currentLoading = actions.fetchInitialNotifs('2')
    expect(mocks.get).toHaveBeenCalledTimes(2)
    old.resolve(list([notif(1)], 1))
    await oldLoading
    expect(store.getState().isLoading).toBe(true)
    expect(store.getState().notifs).toEqual([])
    current.resolve(list([notif(2)], 1))
    await currentLoading
    expect(store.getState().notifs.map((item) => item.notifId)).toEqual([2])
    expect(store.getState().isLoading).toBe(false)
  })

  it('로그아웃 후 같은 계정으로 다시 로그인해도 이전 읽음 결과를 반영하지 않는다', async () => {
    actions.receiveNotif(notif(1))
    const read = deferred<typeof failure>()
    mocks.read.mockReturnValueOnce(read.promise)
    const reading = actions.markAsRead(1)
    const rejected = expect(reading).rejects.toThrow('요청 실패')
    invalidate()
    store.getState().resetNotifs()
    actions.receiveNotif(notif(2))
    read.resolve(failure)
    await rejected
    expect(store.getState().notifs.map((item) => item.notifId)).toEqual([2])
    expect(mocks.get).not.toHaveBeenCalled()
  })
})

describe('SSE 연결과 REST 조회 경계', () => {
  async function subscribe() {
    const { useNotifSubscription } = await import('@/featured/notif/hooks/useNotifSubscription')
    // eslint-disable-next-line react-hooks/rules-of-hooks -- Hook lifecycle is mocked for callback-level tests.
    useNotifSubscription()
    return mocks.connect.mock.calls.at(-1)![1]
  }

  async function connected(options: FetchEventSourceInit) {
    await options.onopen?.(new Response(null, { headers: { 'content-type': 'text/event-stream' } }))
    options.onmessage?.({ event: 'connect', data: 'connected', id: '', retry: undefined })
  }

  it('최초 조회와 최초 SSE 연결 사이에 생긴 알림도 연결 후 다시 조회한다', async () => {
    const initial = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(initial.promise).mockResolvedValue(list([notif(2), notif(1)], 2))
    const options = await subscribe()
    await connected(options)
    initial.resolve(list([notif(1)], 1))
    await flush()
    expect(mocks.get).toHaveBeenCalledTimes(2)
    expect(store.getState().notifs.map((item) => item.notifId)).toEqual([2, 1])
    expect(store.getState().unreadCount).toBe(2)
  })

  it('재연결 전 시작된 조회가 있어도 연결 후의 새 조회를 보장한다', async () => {
    mocks.get.mockResolvedValue(list([notif(1)], 1))
    const options = await subscribe()
    await connected(options)
    await flush()
    const pending = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(pending.promise).mockResolvedValue(list([notif(2), notif(1)], 2))
    const beforeReconnect = actions.fetchInitialNotifs('1')
    const callsBefore = mocks.get.mock.calls.length
    await connected(options)
    pending.resolve(list([notif(1)], 1))
    await beforeReconnect
    await flush()
    expect(mocks.get).toHaveBeenCalledTimes(callsBefore + 1)
    expect(store.getState().unreadCount).toBe(2)
    expect(store.getState().notifs.map((item) => item.notifId)).toEqual([2, 1])
  })

  it('이전 연결의 인증 갱신 결과가 새 사용자의 SSE 연결을 종료하지 않는다', async () => {
    const refresh = deferred<{ status: 'invalid' }>()
    mocks.refresh.mockReturnValueOnce(refresh.promise)
    const oldOptions = await subscribe()
    const oldRecovery = oldOptions.onopen!(new Response(null, { status: 401 }))
    await flush()
    mocks.cleanups.pop()!()
    const { clearNotifClientSession } = await import('@/featured/notif/hooks/notifClientSession')
    clearNotifClientSession()
    mocks.auth.user = { id: 2 }
    const newOptions = await subscribe()
    await connected(newOptions)
    await flush()
    refresh.resolve({ status: 'invalid' })
    await oldRecovery
    expect(newOptions.signal?.aborted).toBe(false)
    newOptions.onmessage?.({
      event: 'notif',
      data: JSON.stringify(notif(2)),
      id: '',
      retry: undefined,
    })
    expect(store.getState().notifs.map((item) => item.notifId)).toEqual([2])
  })
})
