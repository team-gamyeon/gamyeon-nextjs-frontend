'use client'

import { useCallback, useMemo } from 'react'
import { useAuthStore } from '@/featured/auth/store'
import type { ApiResponse } from '@/shared/lib/api'
import {
  getNotifsAction,
  markAllNotifsAsReadAction,
  markNotifAsReadAction,
} from '../actions/notif.action'
import { useNotifStore } from '../store'
import type { Notif, NotifListData } from '../types'

const MUTATION_SETTLE_DELAY_MS = 250
const UNREAD_COUNT_RESYNC_RETRY_DELAY_MS = 1000
const SUPPRESSED_READ_RETRY_BASE_DELAY_MS = 1000
const SUPPRESSED_READ_RETRY_MAX_DELAY_MS = 30000
const NOTIF_SYNC_RETRY_BASE_DELAY_MS = 1000
const NOTIF_SYNC_RETRY_MAX_DELAY_MS = 30000

interface InitialNotifLoad {
  sessionKey: string
  generation: number
  catchUp: boolean
  promise: Promise<void>
}

interface NotifSessionSnapshot {
  sessionKey: string
  generation: number
}

interface NotifCatchUp extends NotifSessionSnapshot {
  controller: AbortController
  revision: number
  wakeRetry?: () => void
  promise: Promise<void>
}

let initialNotifLoad: InitialNotifLoad | null = null
let notifSessionGeneration = 0
let listLoadGeneration = 0
// SSE로 받은 최신 알림은 누락 구간보다 앞설 수 있으므로 복구 종료 기준으로 쓰지 않는다.
let lastSyncedNotifIds: ReadonlySet<number> | null = null
let notifCatchUp: NotifCatchUp | null = null
let unreadCountResyncRetryTimer: ReturnType<typeof setTimeout> | null = null
const activeSuppressedReadKeys = new Set<string>()
const suppressedReadRetryAttempts = new Map<string, number>()
const suppressedReadRetryTimers = new Map<string, ReturnType<typeof setTimeout>>()

class NotifActionError extends Error {
  readonly code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'NotifActionError'
    this.code = code
  }
}

function createNotifActionError(
  response: Pick<ApiResponse<unknown>, 'code' | 'message'>,
  fallbackMessage: string,
): NotifActionError {
  return new NotifActionError(response.message || fallbackMessage, response.code || 'UNKNOWN_ERROR')
}

function getNotifListData(
  response: ApiResponse<NotifListData>,
  fallbackMessage: string,
): NotifListData {
  if (!response.success) {
    throw createNotifActionError(response, fallbackMessage)
  }

  if (response.data === null) {
    throw new NotifActionError(
      response.message || '알림 응답 데이터가 없습니다.',
      response.code || 'INVALID_RESPONSE',
    )
  }

  return response.data
}

function assertNotifActionSuccess(response: ApiResponse<unknown>, fallbackMessage: string): void {
  if (!response.success) {
    throw createNotifActionError(response, fallbackMessage)
  }
}

function waitForDelay(delayMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}

function getCurrentNotifSession(): NotifSessionSnapshot | null {
  const authState = useAuthStore.getState()

  if (!authState.isLoggedIn || authState.user === null) return null

  return {
    sessionKey: String(authState.user.id),
    generation: notifSessionGeneration,
  }
}

function isCurrentNotifSession(sessionKey: string, generation: number): boolean {
  const authState = useAuthStore.getState()

  return (
    notifSessionGeneration === generation &&
    authState.isLoggedIn &&
    authState.user !== null &&
    String(authState.user.id) === sessionKey
  )
}

async function waitForNotifMutationsToSettle(
  sessionKey: string,
  generation: number,
): Promise<boolean> {
  let lastRevision = useNotifStore.getState().mutationRevision

  while (isCurrentNotifSession(sessionKey, generation)) {
    await waitForDelay(MUTATION_SETTLE_DELAY_MS)

    if (!isCurrentNotifSession(sessionKey, generation)) return false

    const currentRevision = useNotifStore.getState().mutationRevision
    if (currentRevision === lastRevision && !useNotifStore.getState().isMarkingAllAsRead) {
      return true
    }

    lastRevision = currentRevision
  }

  return false
}

function clearUnreadCountResyncRetry(): void {
  if (unreadCountResyncRetryTimer === null) return

  clearTimeout(unreadCountResyncRetryTimer)
  unreadCountResyncRetryTimer = null
}

function getSuppressedReadKey(session: NotifSessionSnapshot, notifId: number): string {
  return `${session.generation}:${session.sessionKey}:${notifId}`
}

function clearSuppressedReadRetries(): void {
  for (const timer of suppressedReadRetryTimers.values()) {
    clearTimeout(timer)
  }

  activeSuppressedReadKeys.clear()
  suppressedReadRetryAttempts.clear()
  suppressedReadRetryTimers.clear()
}

function scheduleSuppressedReadRetry(
  notifId: number,
  session: NotifSessionSnapshot,
  key: string,
): void {
  if (
    !isCurrentNotifSession(session.sessionKey, session.generation) ||
    !useNotifStore.getState().unsyncedSuppressedNotifIds.has(notifId) ||
    suppressedReadRetryTimers.has(key)
  ) {
    return
  }

  const retryAttempt = (suppressedReadRetryAttempts.get(key) ?? 0) + 1
  suppressedReadRetryAttempts.set(key, retryAttempt)
  const retryDelay = Math.min(
    SUPPRESSED_READ_RETRY_BASE_DELAY_MS * 2 ** Math.min(retryAttempt - 1, 5),
    SUPPRESSED_READ_RETRY_MAX_DELAY_MS,
  )

  const timer = setTimeout(() => {
    suppressedReadRetryTimers.delete(key)
    syncSuppressedNotifRead(notifId, session)
  }, retryDelay)
  suppressedReadRetryTimers.set(key, timer)
}

async function syncSuppressedNotifRead(
  notifId: number,
  session: NotifSessionSnapshot,
): Promise<void> {
  const key = getSuppressedReadKey(session, notifId)

  if (
    activeSuppressedReadKeys.has(key) ||
    !isCurrentNotifSession(session.sessionKey, session.generation) ||
    !useNotifStore.getState().unsyncedSuppressedNotifIds.has(notifId)
  ) {
    return
  }

  activeSuppressedReadKeys.add(key)

  try {
    const response = await markNotifAsReadAction(notifId)
    assertNotifActionSuccess(response, 'Failed to mark the superseded notification as read.')
  } catch (error) {
    if (isCurrentNotifSession(session.sessionKey, session.generation)) {
      console.error('Failed to sync a superseded notification read.', error)
      scheduleSuppressedReadRetry(notifId, session, key)
    }
    return
  } finally {
    activeSuppressedReadKeys.delete(key)
  }

  if (!isCurrentNotifSession(session.sessionKey, session.generation)) return

  suppressedReadRetryAttempts.delete(key)
  useNotifStore.getState().confirmSuppressedNotifRead(notifId)
  resyncIfPendingSettled(session)
}

function syncSuppressedNotifReads(notifIds: number[], session: NotifSessionSnapshot): void {
  for (const notifId of notifIds) {
    void syncSuppressedNotifRead(notifId, session)
  }
}

/** pending 읽음을 모두 해소한 시점에 배지 unreadCount를 서버 값으로 재동기화한다. */
function resyncIfPendingSettled(session: NotifSessionSnapshot, isRetry = false): void {
  if (!isCurrentNotifSession(session.sessionKey, session.generation)) return
  const notifState = useNotifStore.getState()
  if (
    notifState.pendingReadNotifIds.size > 0 ||
    notifState.unsyncedSuppressedNotifIds.size > 0 ||
    notifState.isMarkingAllAsRead
  ) {
    return
  }

  void requestNotifResync(session)
    .then(clearUnreadCountResyncRetry)
    .catch((error: unknown) => {
      if (!isCurrentNotifSession(session.sessionKey, session.generation)) return

      console.error('알림 배지 재동기화에 실패했습니다.', error)

      if (isRetry || unreadCountResyncRetryTimer !== null) return

      unreadCountResyncRetryTimer = setTimeout(() => {
        unreadCountResyncRetryTimer = null
        resyncIfPendingSettled(session, true)
      }, UNREAD_COUNT_RESYNC_RETRY_DELAY_MS)
    })
}

async function performInitialNotifLoad(
  sessionKey: string,
  generation: number,
  catchUp: boolean,
): Promise<void> {
  if (
    !isCurrentNotifSession(sessionKey, generation) ||
    !useNotifStore.getState().beginInitialLoad()
  ) {
    return
  }

  // 더 보기의 과거 응답이 복구된 목록, 배지, 커서를 덮어쓰지 않게 한다.
  listLoadGeneration += 1
  const knownNotifIds = lastSyncedNotifIds

  try {
    while (isCurrentNotifSession(sessionKey, generation)) {
      const revisionAtRequestStart = useNotifStore.getState().mutationRevision
      const response = await getNotifsAction()

      if (!isCurrentNotifSession(sessionKey, generation)) return

      let data = getNotifListData(response, '알림 목록을 불러오지 못했습니다.')
      const firstPageIds = new Set(data.notifs.map((notif) => notif.notifId))
      // 최초 조회가 SSE 변경 때문에 재조회되더라도 최초 서버 스냅샷을 기준으로 삼는다.
      // 재조회된 최신 5건으로 기준을 옮기면 그 사이 누락된 과거 알림을 건너뛸 수 있다.
      if (!catchUp && lastSyncedNotifIds === null) lastSyncedNotifIds = firstPageIds
      const notifs = [...data.notifs]
      const visitedCursors = new Set<number>()
      let reachedKnownNotif = data.notifs.some((notif) => knownNotifIds?.has(notif.notifId))

      while (
        catchUp &&
        !reachedKnownNotif &&
        data.hasNext &&
        useNotifStore.getState().mutationRevision === revisionAtRequestStart
      ) {
        const cursorId = data.nextCursorId
        if (cursorId === null || visitedCursors.has(cursorId)) {
          throw new Error('알림 복구 조회의 페이지 커서가 진행하지 않습니다.')
        }
        visitedCursors.add(cursorId)

        const page = await getNotifsAction({ cursorId })
        if (!isCurrentNotifSession(sessionKey, generation)) return

        data = getNotifListData(page, '누락된 알림을 불러오지 못했습니다.')
        notifs.push(...data.notifs)
        reachedKnownNotif = data.notifs.some((notif) => knownNotifIds?.has(notif.notifId))
      }

      if (
        useNotifStore.getState().mutationRevision === revisionAtRequestStart &&
        !useNotifStore.getState().isMarkingAllAsRead
      ) {
        // 페이지를 모두 받은 뒤 반영해야 중간 실패 후에도 복구 기준이 앞당겨지지 않는다.
        const newlySuppressedNotifIds = useNotifStore
          .getState()
          .applyInitialNotifs({ ...data, notifs })
        if (catchUp) lastSyncedNotifIds = firstPageIds
        syncSuppressedNotifReads(newlySuppressedNotifIds, { sessionKey, generation })
        return
      }

      const hasSettled = await waitForNotifMutationsToSettle(sessionKey, generation)
      if (!hasSettled) return
    }
  } finally {
    if (isCurrentNotifSession(sessionKey, generation)) {
      useNotifStore.getState().finishInitialLoad()
    }
  }
}

function requestInitialNotifs(sessionKey: string, catchUp = false): Promise<void> {
  const generation = notifSessionGeneration

  if (
    initialNotifLoad?.sessionKey === sessionKey &&
    initialNotifLoad.generation === generation &&
    (!catchUp || initialNotifLoad.catchUp)
  ) {
    return initialNotifLoad.promise
  }

  if (initialNotifLoad) {
    return initialNotifLoad.promise
      .catch(() => undefined)
      .then(() => {
        if (!isCurrentNotifSession(sessionKey, generation)) return
        return requestInitialNotifs(sessionKey, catchUp)
      })
  }

  const promise = performInitialNotifLoad(sessionKey, generation, catchUp).finally(() => {
    if (initialNotifLoad?.promise === promise) {
      initialNotifLoad = null
    }
  })

  initialNotifLoad = { sessionKey, generation, catchUp, promise }
  return promise
}

function requestNotifResync(session: NotifSessionSnapshot): Promise<void> {
  const activeLoad = initialNotifLoad

  if (
    activeLoad?.sessionKey !== session.sessionKey ||
    activeLoad.generation !== session.generation
  ) {
    return requestInitialNotifs(session.sessionKey)
  }

  return activeLoad.promise
    .catch(() => undefined)
    .then(() => {
      if (!isCurrentNotifSession(session.sessionKey, session.generation)) return
      return requestInitialNotifs(session.sessionKey)
    })
}

function isCurrentCatchUp(sync: NotifCatchUp): boolean {
  return !sync.controller.signal.aborted && isCurrentNotifSession(sync.sessionKey, sync.generation)
}

function waitForNotifSyncRetry(sync: NotifCatchUp, delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer)
      sync.controller.signal.removeEventListener('abort', finish)
      sync.wakeRetry = undefined
      resolve()
    }
    const timer = setTimeout(finish, delayMs)
    sync.wakeRetry = finish
    sync.controller.signal.addEventListener('abort', finish, { once: true })
    if (!isCurrentCatchUp(sync)) finish()
  })
}

async function performNotifCatchUp(sync: NotifCatchUp): Promise<void> {
  let retryAttempt = 0

  while (isCurrentCatchUp(sync)) {
    // 연결 전에 시작한 요청의 성공/실패와 무관하게 그 이후 새 조회를 수행한다.
    // 같은 연결 이벤트를 받은 여러 구독자의 요청도 이 대기 중 하나로 합친다.
    await initialNotifLoad?.promise.catch(() => undefined)
    if (!isCurrentCatchUp(sync)) return

    const revision = sync.revision
    try {
      await requestInitialNotifs(sync.sessionKey, true)
      if (!isCurrentCatchUp(sync) || sync.revision === revision) return
      retryAttempt = 0
    } catch (error) {
      if (!isCurrentCatchUp(sync)) return
      console.error('알림 누락 보정에 실패하여 재시도합니다.', error)
      const delayMs = Math.min(
        NOTIF_SYNC_RETRY_BASE_DELAY_MS * 2 ** Math.min(retryAttempt++, 5),
        NOTIF_SYNC_RETRY_MAX_DELAY_MS,
      )
      await waitForNotifSyncRetry(sync, delayMs)
    }
  }
}

function requestNotifCatchUp(session: NotifSessionSnapshot): Promise<void> {
  if (
    notifCatchUp?.sessionKey === session.sessionKey &&
    notifCatchUp.generation === session.generation
  ) {
    // 진행 중인 조회 도중 다시 연결되면 완료 후 한 번 더 조회한다.
    notifCatchUp.revision += 1
    notifCatchUp.wakeRetry?.()
    return notifCatchUp.promise
  }

  cancelNotifResync()
  const sync: NotifCatchUp = {
    ...session,
    controller: new AbortController(),
    revision: 0,
    promise: Promise.resolve(),
  }
  notifCatchUp = sync
  sync.promise = performNotifCatchUp(sync).finally(() => {
    if (notifCatchUp === sync) notifCatchUp = null
  })
  return sync.promise
}

/** 마지막 SSE 구독 해제 또는 인증 변경 시 예약된 복구 재시도를 종료한다. */
export function cancelNotifResync(): void {
  notifCatchUp?.controller.abort()
  notifCatchUp = null
}

/** 인증 경계가 바뀐 뒤 이전 세션의 비동기 결과가 store에 적용되지 않게 한다. */
export function invalidateNotifSession(): void {
  cancelNotifResync()
  clearUnreadCountResyncRetry()
  clearSuppressedReadRetries()
  notifSessionGeneration += 1
  lastSyncedNotifIds = null
}

export function useNotifActions() {
  const fetchInitialNotifs = useCallback(
    (sessionKey: string) => requestInitialNotifs(sessionKey),
    [],
  )

  const resyncNotifs = useCallback((sessionKey: string): Promise<void> => {
    const session = getCurrentNotifSession()
    if (!session || session.sessionKey !== sessionKey) return Promise.resolve()
    return requestNotifCatchUp(session)
  }, [])

  const fetchMoreNotifs = useCallback(async () => {
    const session = getCurrentNotifSession()
    if (!session) return

    const cursorId = useNotifStore.getState().beginMoreLoad()

    if (cursorId === null) return

    const revisionAtRequestStart = useNotifStore.getState().mutationRevision
    const listGenerationAtRequestStart = listLoadGeneration

    try {
      const response = await getNotifsAction({ cursorId })
      if (!isCurrentNotifSession(session.sessionKey, session.generation)) return

      if (listLoadGeneration !== listGenerationAtRequestStart) return
      if (useNotifStore.getState().mutationRevision !== revisionAtRequestStart) return

      const data = getNotifListData(response, '알림 목록을 추가로 불러오지 못했습니다.')
      const newlySuppressedNotifIds = useNotifStore.getState().appendNotifs(data)
      syncSuppressedNotifReads(newlySuppressedNotifIds, session)
    } finally {
      if (isCurrentNotifSession(session.sessionKey, session.generation)) {
        useNotifStore.getState().finishMoreLoad()
      }
    }
  }, [])

  const receiveNotif = useCallback((notif: Notif) => {
    const session = getCurrentNotifSession()
    if (!session) return

    const newlySuppressedNotifIds = useNotifStore.getState().prependNotif(notif)
    syncSuppressedNotifReads(newlySuppressedNotifIds, session)
  }, [])

  const markAsRead = useCallback(async (notifId: number) => {
    const session = getCurrentNotifSession()
    if (!session) return

    const targetNotif = useNotifStore.getState().notifs.find((notif) => notif.notifId === notifId)

    if (!targetNotif || targetNotif.isRead) return

    const removedNotif = useNotifStore.getState().beginNotifRead(notifId)
    if (!removedNotif) return

    try {
      const response = await markNotifAsReadAction(notifId)
      assertNotifActionSuccess(response, '알림을 읽음 처리하지 못했습니다.')
    } catch (error) {
      if (isCurrentNotifSession(session.sessionKey, session.generation)) {
        useNotifStore.getState().rollbackNotifRead(removedNotif)
        resyncIfPendingSettled(session)
      }

      throw error
    }

    if (!isCurrentNotifSession(session.sessionKey, session.generation)) return

    useNotifStore.getState().confirmNotifRead(notifId)
    resyncIfPendingSettled(session)
  }, [])

  const markProcessingAsRead = useCallback(
    async (notifId: number) => {
      const targetNotif = useNotifStore.getState().notifs.find((notif) => notif.notifId === notifId)

      if (!targetNotif || targetNotif.notifType !== 'REPORT_PROCESSING') return

      await markAsRead(notifId)
    },
    [markAsRead],
  )

  const markAllAsRead = useCallback(async () => {
    const session = getCurrentNotifSession()
    if (!session) return

    const snapshot = useNotifStore.getState().beginAllNotifsRead()
    if (!snapshot) return

    try {
      const response = await markAllNotifsAsReadAction()
      assertNotifActionSuccess(response, '알림을 모두 읽음 처리하지 못했습니다.')
    } catch (error) {
      if (isCurrentNotifSession(session.sessionKey, session.generation)) {
        useNotifStore.getState().rollbackAllNotifsRead(snapshot)
        resyncIfPendingSettled(session)
      }

      throw error
    }

    if (!isCurrentNotifSession(session.sessionKey, session.generation)) return

    useNotifStore.getState().confirmAllNotifsRead(snapshot)
    resyncIfPendingSettled(session)
  }, [])

  return useMemo(
    () => ({
      fetchInitialNotifs,
      resyncNotifs,
      fetchMoreNotifs,
      receiveNotif,
      markAsRead,
      markProcessingAsRead,
      markAllAsRead,
    }),
    [
      fetchInitialNotifs,
      resyncNotifs,
      fetchMoreNotifs,
      markAllAsRead,
      markAsRead,
      markProcessingAsRead,
      receiveNotif,
    ],
  )
}
