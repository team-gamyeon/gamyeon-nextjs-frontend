'use client'

import { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { Bell, CheckCircle2, CircleAlert, Loader2, Megaphone } from 'lucide-react'
import type { Notif, NotifType } from '@/featured/notif/types'
import { cn } from '@/shared/lib/utils'

const MOCK_NOTIFS = [
  {
    notifId: 105,
    notifType: 'REPORT_PROCESSING',
    title: '면접 분석 중',
    content: '2026.08.08 프론트엔드 개발자 면접을 분석하고 있어요.',
    targetId: 205,
    isRead: false,
    createdAt: '2026-08-08T14:35:00+09:00',
  },
  {
    notifId: 104,
    notifType: 'REPORT_SUCCESS',
    title: '면접 분석 완료',
    content: '2026.08.08 백엔드 개발자 면접 분석이 완료됐어요.',
    targetId: 204,
    isRead: false,
    createdAt: '2026-08-08T13:30:00+09:00',
  },
  {
    notifId: 103,
    notifType: 'REPORT_FAILED',
    title: '면접 분석 실패',
    content: '2026.08.07 풀스택 개발자 면접 분석에 실패했어요.',
    targetId: 203,
    isRead: false,
    createdAt: '2026-08-07T18:20:00+09:00',
  },
  {
    notifId: 102,
    notifType: 'NOTICE',
    title: '공지사항',
    content: '가면 서비스 업데이트 안내 (v1.2.0)',
    targetId: 52,
    isRead: true,
    createdAt: '2026-08-06T10:00:00+09:00',
  },
  {
    notifId: 101,
    notifType: 'REPORT_SUCCESS',
    title: '면접 분석 완료',
    content: '2026.08.05 프론트엔드 개발자 면접 분석이 완료됐어요.',
    targetId: 201,
    isRead: true,
    createdAt: '2026-08-05T16:00:00+09:00',
  },
] satisfies Notif[]

const typeConfig: Record<NotifType, { icon: React.ElementType; color: string }> = {
  NOTICE: { icon: Megaphone, color: 'text-blue-500' },
  REPORT_PROCESSING: { icon: Loader2, color: 'text-primary' },
  REPORT_SUCCESS: { icon: CheckCircle2, color: 'text-green-500' },
  REPORT_FAILED: { icon: CircleAlert, color: 'text-red-500' },
}

export function NotificationButton() {
  const [notifs, setNotifs] = useState<Notif[]>(MOCK_NOTIFS)
  const unreadCount = notifs.filter((notif) => !notif.isRead).length

  const markAllRead = () => {
    setNotifs((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="text-muted-foreground hover:bg-muted hover:text-foreground relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors outline-none"
          aria-label="알림"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="border-border/50 flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">알림</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-muted-foreground hover:text-foreground text-xs transition"
            >
              모두 읽음
            </button>
          )}
        </div>

        {notifs.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">알림이 없어요.</div>
        ) : (
          <ul>
            {notifs.map((notif, idx) => {
              const { icon: Icon, color } = typeConfig[notif.notifType]
              return (
                <li
                  key={notif.notifId}
                  className={cn(
                    'flex cursor-pointer gap-3 px-4 py-3 transition',
                    'hover:bg-muted/60',
                    idx !== notifs.length - 1 && 'border-border/40 border-b',
                    !notif.isRead && 'bg-primary/5',
                  )}
                  onClick={() =>
                    setNotifs((prev) =>
                      prev.map((item) =>
                        item.notifId === notif.notifId ? { ...item, isRead: true } : item,
                      ),
                    )
                  }
                >
                  <div className={cn('mt-0.5 shrink-0', color)}>
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        notif.notifType === 'REPORT_PROCESSING' && 'animate-spin',
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{notif.title}</p>
                      {!notif.isRead && (
                        <span className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                      {notif.content}
                    </p>
                    <time
                      dateTime={notif.createdAt}
                      className="text-muted-foreground/70 mt-1 block text-[11px]"
                    >
                      {new Date(notif.createdAt).toLocaleString('ko-KR', {
                        timeZone: 'Asia/Seoul',
                        month: 'numeric',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
