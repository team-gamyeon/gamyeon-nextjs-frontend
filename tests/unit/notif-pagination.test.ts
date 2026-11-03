import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ApiResponse } from '@/shared/lib/api'
import type { Notif, NotifListData } from '@/featured/notif/types'

const mocks = vi.hoisted(() => ({ get: vi.fn() }))

// Keep the real actions and store; control REST completion order without mounting UI.
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

function notif(notifId: number, isRead = false): Notif {
  return {
    notifId,
    notifType: 'NOTICE',
    title: '알림',
    content: '내용',
    targetId: notifId,
    isRead,
    createdAt: new Date(1700000000000 + notifId * 1000).toISOString(),
  }
}

function list(
  notifs: Notif[],
  unreadCount: number,
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

const failure = { success: false, code: 'FAILED', message: '조회 실패', data: null }

let store: typeof import('@/featured/notif/store').useNotifStore
let actions: ReturnType<typeof import('@/featured/notif/hooks/useNotifActions').useNotifActions>

beforeEach(async () => {
  vi.resetModules()
  vi.resetAllMocks()
  store = (await import('@/featured/notif/store')).useNotifStore
  const actionsModule = await import('@/featured/notif/hooks/useNotifActions')
  actions = actionsModule.useNotifActions()
  store.getState().applyInitialNotifs(list([notif(3)], 3, true, 3).data!)
})

describe('알림 페이지 조회의 응답 순서', () => {
  it('최신 조회와 겹치지 않은 더 보기 결과는 정상 반영한다', async () => {
    mocks.get.mockResolvedValueOnce(list([notif(2), notif(1)], 3))

    await actions.fetchMoreNotifs()

    expect(mocks.get).toHaveBeenCalledWith({ cursorId: 3 })
    expect(store.getState()).toMatchObject({
      notifs: [notif(3), notif(2), notif(1)],
      unreadCount: 3,
      hasMore: false,
      nextCursorId: null,
      isLoadingMore: false,
    })
  })

  it.each(['최신 조회 완료 후', '최신 조회 완료 전'] as const)(
    '%s 도착한 과거 페이지가 목록·배지·커서를 덮어쓰지 않는다',
    async (responseOrder) => {
      const more = deferred<ApiResponse<NotifListData>>()
      const latest = deferred<ApiResponse<NotifListData>>()
      mocks.get.mockReturnValueOnce(more.promise).mockReturnValueOnce(latest.promise)
      const revisionBefore = store.getState().mutationRevision
      const loadingMore = actions.fetchMoreNotifs()
      const loadingLatest = actions.fetchInitialNotifs('1')

      if (responseOrder === '최신 조회 완료 후') {
        latest.resolve(list([notif(3, true)], 0, true, 3))
        await loadingLatest
      }

      // An ordinary REST refresh does not change mutationRevision.
      expect(store.getState().mutationRevision).toBe(revisionBefore)
      const stateBeforeOldResponse = store.getState()
      more.resolve(list([notif(2), notif(1)], 3))
      await loadingMore

      expect(store.getState()).toMatchObject({
        notifs: stateBeforeOldResponse.notifs,
        unreadCount: stateBeforeOldResponse.unreadCount,
        nextCursorId: stateBeforeOldResponse.nextCursorId,
        hasMore: stateBeforeOldResponse.hasMore,
        isLoadingMore: false,
      })

      if (responseOrder === '최신 조회 완료 전') {
        latest.resolve(list([notif(3, true)], 0, true, 3))
        await loadingLatest
      }

      expect(store.getState()).toMatchObject({
        notifs: [notif(3, true)],
        unreadCount: 0,
        nextCursorId: 3,
        hasMore: true,
        isLoading: false,
        isLoadingMore: false,
      })

      // The ignored page must remain available for a fresh pagination request.
      mocks.get.mockResolvedValueOnce(list([notif(2, true), notif(1, true)], 0))
      await actions.fetchMoreNotifs()
      expect(mocks.get).toHaveBeenLastCalledWith({ cursorId: 3 })
      expect(store.getState().notifs).toEqual([notif(3, true), notif(2, true), notif(1, true)])
    },
  )

  it('무효화된 과거 페이지의 API 실패 응답도 무시하고 로딩을 종료한다', async () => {
    const more = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(more.promise).mockResolvedValueOnce(list([notif(3, true)], 0))
    const loadingMore = actions.fetchMoreNotifs()
    await actions.fetchInitialNotifs('1')

    more.resolve(failure)
    await expect(loadingMore).resolves.toBeUndefined()

    expect(store.getState()).toMatchObject({
      notifs: [notif(3, true)],
      unreadCount: 0,
      hasMore: false,
      nextCursorId: null,
      isLoadingMore: false,
    })
  })

  it('더 보기 도중 SSE가 도착하면 기존 변경 검사로 과거 응답을 무시한다', async () => {
    const more = deferred<ApiResponse<NotifListData>>()
    mocks.get.mockReturnValueOnce(more.promise)
    const loadingMore = actions.fetchMoreNotifs()
    actions.receiveNotif(notif(4))
    more.resolve(list([notif(2), notif(1)], 3))
    await loadingMore

    expect(store.getState()).toMatchObject({
      notifs: [notif(4), notif(3)],
      unreadCount: 4,
      hasMore: true,
      nextCursorId: 3,
      isLoadingMore: false,
    })
  })

  it('유효한 더 보기의 API 실패는 전달하고 재시도할 수 있도록 로딩을 종료한다', async () => {
    mocks.get.mockResolvedValueOnce(failure)

    await expect(actions.fetchMoreNotifs()).rejects.toThrow('조회 실패')

    expect(store.getState()).toMatchObject({
      notifs: [notif(3)],
      unreadCount: 3,
      hasMore: true,
      nextCursorId: 3,
      isLoadingMore: false,
    })
  })
})
