import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiResponse } from '@/shared/lib/api'
import type { Notif, NotifListData } from '@/featured/notif/types'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  read: vi.fn(),
  auth: { isLoggedIn: true, user: { id: 1 } },
}))

// Exercise the real hook callbacks and store while controlling network completion order.
vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useCallback: (callback: unknown) => callback,
  useMemo: (factory: () => unknown) => factory(),
}))

vi.mock('@/featured/auth/store', () => ({
  useAuthStore: { getState: () => mocks.auth },
}))

vi.mock('@/featured/notif/actions/notif.action', () => ({
  getNotifsAction: mocks.get,
  markNotifAsReadAction: mocks.read,
  markAllNotifsAsReadAction: vi.fn(),
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

const processing: Notif = {
  notifId: 1,
  notifType: 'REPORT_PROCESSING',
  title: '분석 중',
  content: '분석을 진행하고 있습니다.',
  targetId: 10,
  isRead: false,
  createdAt: '2026-11-03T00:00:00Z',
}
const notice: Notif = {
  ...processing,
  notifId: 2,
  notifType: 'NOTICE',
  targetId: 20,
  createdAt: '2026-11-03T00:01:00Z',
}
const success: ApiResponse<null> = { success: true, code: 'OK', message: '', data: null }
const failure: ApiResponse<null> = {
  success: false,
  code: 'FAILED',
  message: '읽음 처리 실패',
  data: null,
}

function list(notifs: Notif[], unreadCount: number): ApiResponse<NotifListData> {
  return {
    success: true,
    code: 'OK',
    message: '',
    data: { notifs, unreadCount, hasNext: true, nextCursorId: 1 },
  }
}

let store: typeof import('@/featured/notif/store').useNotifStore
let actionsModule: typeof import('@/featured/notif/hooks/useNotifActions')
let actions: ReturnType<typeof actionsModule.useNotifActions>

function expectReadWithOneUnread() {
  expect(store.getState().unreadCount).toBe(1)
  expect(store.getState().notifs.find((notif) => notif.notifId === 1)).toEqual({
    ...processing,
    isRead: true,
  })
  expect(store.getState().notifs.find((notif) => notif.notifId === 2)).toEqual(notice)
}

beforeEach(async () => {
  vi.useFakeTimers()
  vi.resetModules()
  vi.resetAllMocks()
  mocks.auth.isLoggedIn = true
  mocks.auth.user = { id: 1 }
  mocks.read.mockResolvedValue(success)
  // A page can omit the processing notification while reporting the global unread count.
  mocks.get.mockResolvedValue(list([notice], 1))
  store = (await import('@/featured/notif/store')).useNotifStore
  actionsModule = await import('@/featured/notif/hooks/useNotifActions')
  actions = actionsModule.useNotifActions()
  store.getState().applyInitialNotifs(list([notice, processing], 2).data!)
})

afterEach(() => {
  actionsModule.invalidateNotifSession()
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('분석 중 알림 읽음 처리', () => {
  it('여러 훅에서 연속 클릭해도 요청은 한 번만 보내고 항목을 유지한다', async () => {
    const read = deferred<ApiResponse<null>>()
    mocks.read.mockReturnValueOnce(read.promise)
    const otherActions = actionsModule.useNotifActions()

    const first = actions.markProcessingAsRead(1)
    const second = otherActions.markProcessingAsRead(1)
    const third = actions.markAsRead(1)

    expect(mocks.read).toHaveBeenCalledTimes(1)
    expect(mocks.read).toHaveBeenCalledWith(1)
    expectReadWithOneUnread()
    expect(store.getState().pendingReadNotifIds.has(1)).toBe(true)

    read.resolve(success)
    await Promise.all([first, second, third])
    await vi.runAllTimersAsync()

    expectReadWithOneUnread()
    expect(store.getState().pendingReadNotifIds.size).toBe(0)
    expect(mocks.get).toHaveBeenCalled()
  })

  it.each(['initial', 'more'] as const)(
    '읽음 요청 중 시작한 %s 조회가 서버 카운트를 먼저 받아도 이중 차감하지 않는다',
    async (loadType) => {
      const read = deferred<ApiResponse<null>>()
      mocks.read.mockReturnValueOnce(read.promise)
      const reading = actions.markProcessingAsRead(1)

      if (loadType === 'initial') await actions.fetchInitialNotifs('1')
      else await actions.fetchMoreNotifs()

      read.resolve(success)
      await reading
      await vi.runAllTimersAsync()

      expectReadWithOneUnread()
      expect(store.getState().pendingReadNotifIds.size).toBe(0)
    },
  )

  it.each([
    ['initial', '조회 먼저', true],
    ['initial', '읽음 먼저', true],
    ['more', '조회 먼저', true],
    ['more', '읽음 먼저', true],
    ['initial', '조회 먼저', false],
    ['initial', '읽음 먼저', false],
    ['more', '조회 먼저', false],
    ['more', '읽음 먼저', false],
  ] as const)(
    '기존 %s 조회와 경합: %s, 페이지에 분석 알림 포함=%s',
    async (loadType, order, includesProcessing) => {
      const get = deferred<ApiResponse<NotifListData>>()
      const read = deferred<ApiResponse<null>>()
      mocks.get.mockReturnValueOnce(get.promise)
      mocks.read.mockReturnValueOnce(read.promise)

      const loading =
        loadType === 'initial' ? actions.fetchInitialNotifs('1') : actions.fetchMoreNotifs()
      const reading = actions.markProcessingAsRead(1)
      // This response predates the read and must not restore the unread item or badge.
      const stalePage = list(includesProcessing ? [notice, processing] : [notice], 2)

      if (order === '조회 먼저') {
        get.resolve(stalePage)
        await vi.advanceTimersByTimeAsync(0)
        expectReadWithOneUnread()
        read.resolve(success)
        await reading
      } else {
        read.resolve(success)
        await reading
        get.resolve(stalePage)
      }

      await vi.runAllTimersAsync()
      await loading

      expectReadWithOneUnread()
      expect(store.getState().pendingReadNotifIds.size).toBe(0)
    },
  )

  it.each(['실패 응답', '네트워크 오류'] as const)(
    '%s이면 상태를 복원하고 다음 클릭으로 재시도할 수 있다',
    async (failureType) => {
      mocks.get.mockResolvedValue(list([notice, processing], 2))
      if (failureType === '실패 응답') mocks.read.mockResolvedValueOnce(failure)
      else mocks.read.mockRejectedValueOnce(new Error('읽음 처리 실패'))

      await expect(actions.markProcessingAsRead(1)).rejects.toThrow('읽음 처리 실패')
      await vi.runAllTimersAsync()

      expect(store.getState().unreadCount).toBe(2)
      expect(store.getState().notifs.find((notif) => notif.notifId === 1)).toEqual(processing)
      expect(store.getState().pendingReadNotifIds.size).toBe(0)

      mocks.get.mockResolvedValue(list([notice], 1))
      await actions.markProcessingAsRead(1)
      await vi.runAllTimersAsync()

      expect(mocks.read).toHaveBeenCalledTimes(2)
      expectReadWithOneUnread()
    },
  )

  it('로그아웃 뒤 도착한 읽음 결과는 초기화된 상태에 적용하지 않는다', async () => {
    const read = deferred<ApiResponse<null>>()
    mocks.read.mockReturnValueOnce(read.promise)
    const reading = actions.markProcessingAsRead(1)

    mocks.auth.isLoggedIn = false
    actionsModule.invalidateNotifSession()
    store.getState().resetNotifs()
    read.resolve(success)
    await reading

    expect(store.getState().notifs).toEqual([])
    expect(store.getState().unreadCount).toBe(0)
    expect(store.getState().pendingReadNotifIds.size).toBe(0)
    expect(mocks.get).not.toHaveBeenCalled()
  })

  it('다른 타입, 없는 알림, 이미 읽은 알림은 요청하지 않는다', async () => {
    await actions.markProcessingAsRead(2)
    await actions.markProcessingAsRead(999)
    store.getState().applyInitialNotifs(list([{ ...processing, isRead: true }, notice], 1).data!)
    await actions.markProcessingAsRead(1)

    expect(mocks.read).not.toHaveBeenCalled()
    expectReadWithOneUnread()
  })
})
