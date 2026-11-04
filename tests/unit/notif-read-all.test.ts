import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiResponse } from '@/shared/lib/api'
import type { Notif, NotifListData } from '@/featured/notif/types'

const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  read: vi.fn(),
  readAll: vi.fn(),
}))

vi.mock('react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react')>()),
  useCallback: (callback: unknown) => callback,
  useMemo: (factory: () => unknown) => factory(),
}))

vi.mock('@/featured/auth/store', () => ({
  useAuthStore: { getState: () => ({ isLoggedIn: true, user: { id: 1 } }) },
}))

vi.mock('@/featured/notif/actions/notif.action', () => ({
  getNotifsAction: mocks.get,
  markNotifAsReadAction: mocks.read,
  markAllNotifsAsReadAction: mocks.readAll,
}))

import { useNotifStore as store } from '@/featured/notif/store'
import { invalidateNotifSession, useNotifActions } from '@/featured/notif/hooks/useNotifActions'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((done, fail) => {
    resolve = done
    reject = fail
  })
  return { promise, resolve, reject }
}

function notif(notifId: number, notifType: Notif['notifType'], isRead = false): Notif {
  return {
    notifId,
    notifType,
    title: '알림',
    content: '내용',
    targetId: 10,
    isRead,
    createdAt: new Date(1700000000000 + notifId * 1000).toISOString(),
  }
}

function list(notifs: Notif[], unreadCount: number): NotifListData {
  return { notifs, unreadCount, hasNext: false, nextCursorId: null }
}

const ok: ApiResponse<null> = { success: true, code: 'OK', message: '', data: null }
const failure: ApiResponse<null> = {
  success: false,
  code: 'FAILED',
  message: '읽음 실패',
  data: null,
}
const processing = notif(1, 'REPORT_PROCESSING')

beforeEach(() => {
  vi.useFakeTimers()
  vi.resetAllMocks()
  store.getState().resetNotifs()
  store.getState().applyInitialNotifs(list([processing], 1))
  mocks.get.mockImplementation(() => new Promise(() => {}))
})

afterEach(() => {
  invalidateNotifSession()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('모두 읽음 중 숨긴 분석 중 알림', () => {
  for (const terminalType of ['REPORT_SUCCESS', 'REPORT_FAILED'] as const) {
    it.each(['실패 응답', '요청 예외'])(
      `${terminalType} 수신 후 %s이면 숨긴 알림을 서버에 읽음 처리한다`,
      async (failureType) => {
        const allRead = deferred<ApiResponse<null>>()
        const hiddenRead = deferred<ApiResponse<null>>()
        mocks.readAll.mockReturnValueOnce(allRead.promise)
        mocks.read.mockReturnValueOnce(hiddenRead.promise)
        const actions = useNotifActions()
        const reading = actions.markAllAsRead()
        const terminal = notif(2, terminalType)

        actions.receiveNotif(terminal)
        expect(mocks.read).not.toHaveBeenCalled()
        const rejected = expect(reading).rejects.toThrow('읽음 실패')
        if (failureType === '실패 응답') allRead.resolve(failure)
        else allRead.reject(new Error('읽음 실패'))
        await rejected

        expect(mocks.read).toHaveBeenCalledExactlyOnceWith(processing.notifId)
        expect(store.getState()).toMatchObject({
          notifs: [terminal],
          unreadCount: 1,
          isMarkingAllAsRead: false,
          pendingReadNotifIds: new Set(),
          suppressedProcessingNotifIds: new Set([1]),
          unsyncedSuppressedNotifIds: new Set([1]),
        })
        // The processing notification may be outside the latest server page.
        mocks.get.mockResolvedValueOnce({ ...ok, data: list([terminal], 1) })
        hiddenRead.resolve(ok)
        await vi.advanceTimersByTimeAsync(0)

        expect(store.getState().unsyncedSuppressedNotifIds.size).toBe(0)
        expect(store.getState().unreadCount).toBe(1)
        expect(mocks.get).toHaveBeenCalledOnce()
      },
    )
  }

  it('개별 읽음이 실패하면 대기열을 유지하고 재시도한다', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const allRead = deferred<ApiResponse<null>>()
    mocks.readAll.mockReturnValueOnce(allRead.promise)
    mocks.read.mockResolvedValueOnce(failure).mockResolvedValueOnce(ok)
    const actions = useNotifActions()
    const reading = actions.markAllAsRead()
    actions.receiveNotif(notif(2, 'REPORT_SUCCESS'))
    const rejected = expect(reading).rejects.toThrow('읽음 실패')
    allRead.resolve(failure)
    await rejected

    expect(mocks.read).toHaveBeenCalledTimes(1)
    expect(store.getState().unsyncedSuppressedNotifIds).toEqual(new Set([1]))
    expect(mocks.get).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1000)

    expect(mocks.read).toHaveBeenCalledTimes(2)
    expect(mocks.read).toHaveBeenLastCalledWith(1)
    expect(store.getState().unsyncedSuppressedNotifIds.size).toBe(0)
    expect(store.getState().unreadCount).toBe(1)
  })

  it('모두 읽음이 성공하면 숨긴 알림을 추가로 읽음 요청하지 않는다', async () => {
    const allRead = deferred<ApiResponse<null>>()
    mocks.readAll.mockReturnValueOnce(allRead.promise)
    const actions = useNotifActions()
    const reading = actions.markAllAsRead()
    const terminal = notif(2, 'REPORT_SUCCESS')
    actions.receiveNotif(terminal)
    allRead.resolve(ok)
    await reading

    expect(mocks.read).not.toHaveBeenCalled()
    expect(store.getState()).toMatchObject({
      notifs: [terminal],
      unreadCount: 1,
      pendingReadNotifIds: new Set(),
      unsyncedSuppressedNotifIds: new Set(),
      isMarkingAllAsRead: false,
    })
  })

  it('롤백은 기존 개별 읽음과 서버 전체 미읽음 수를 유지한다', () => {
    const pending = notif(3, 'NOTICE')
    const visible = notif(4, 'NOTICE')
    store.getState().applyInitialNotifs(list([processing, pending, visible], 5))
    store.getState().beginNotifRead(pending.notifId)
    const snapshot = store.getState().beginAllNotifsRead()!
    const terminal = notif(5, 'REPORT_SUCCESS')
    store.getState().prependNotif(terminal)

    const toSync = store.getState().rollbackAllNotifsRead(snapshot)

    expect(toSync).toEqual([1])
    expect(store.getState()).toMatchObject({
      notifs: [terminal, visible, { ...pending, isRead: true }],
      unreadCount: 4,
      pendingReadNotifIds: new Set([3]),
      unsyncedSuppressedNotifIds: new Set([1]),
    })
    expect(store.getState().rollbackAllNotifsRead(snapshot)).toEqual([])
    expect(store.getState().unreadCount).toBe(4)
  })

  it('완료 알림이 없으면 기존 목록과 미읽음 수를 복구한다', async () => {
    mocks.readAll.mockResolvedValueOnce(failure)
    await expect(useNotifActions().markAllAsRead()).rejects.toThrow('읽음 실패')

    expect(mocks.read).not.toHaveBeenCalled()
    expect(store.getState()).toMatchObject({
      notifs: [processing],
      unreadCount: 1,
      pendingReadNotifIds: new Set(),
      unsyncedSuppressedNotifIds: new Set(),
      isMarkingAllAsRead: false,
    })
  })
})
