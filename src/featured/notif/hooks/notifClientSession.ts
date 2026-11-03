'use client'

import { useAuthStore } from '@/featured/auth/store'
import { useNotifStore } from '../store'
import { invalidateNotifSession } from './useNotifActions'

let disconnectNotifs: () => void = () => undefined

/** SSE hook이 현재 연결을 종료하는 함수를 등록한다. */
export function registerNotifDisconnectHandler(handler: () => void): void {
  disconnectNotifs = handler
}

/** 인증 세션 경계를 넘어가면 안 되는 클라이언트 알림 상태를 정리한다. */
export function clearNotifClientSession(): void {
  disconnectNotifs()
  invalidateNotifSession()
  useNotifStore.getState().resetNotifs()
}

// React effect 정리보다 먼저 인증 경계를 무효화한다. 여러 구독 훅이 있어도
// 한 번만 초기화하며, 렌더 사이의 A → B → A 전환도 서로 다른 세션으로 취급한다.
useAuthStore.subscribe((state, previous) => {
  if (state.isLoggedIn !== previous.isLoggedIn || state.user?.id !== previous.user?.id) {
    clearNotifClientSession()
  }
})
