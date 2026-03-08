'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Bell, CheckCircle2, Loader2, Megaphone } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

type NotificationType = 'notice' | 'analysis_complete' | 'analysis_in_progress'

interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  time: string
  read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'analysis_in_progress',
    title: '면접 분석 중',
    description: '2026.03.09 프론트엔드 개발자 면접을 분석하고 있어요.',
    time: '방금 전',
    read: false,
  },
  {
    id: '2',
    type: 'analysis_complete',
    title: '면접 분석 완료',
    description: '2026.03.08 백엔드 개발자 면접 분석이 완료됐어요.',
    time: '1시간 전',
    read: false,
  },
  {
    id: '3',
    type: 'notice',
    title: '공지사항',
    description: '가면 서비스 업데이트 안내 (v1.2.0)',
    time: '2일 전',
    read: true,
  },
]

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  notice: { icon: Megaphone, color: 'text-blue-500' },
  analysis_complete: { icon: CheckCircle2, color: 'text-green-500' },
  analysis_in_progress: { icon: Loader2, color: 'text-primary' },
}

export function NotificationButton() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="hover:bg-muted relative flex h-9 w-9 items-center justify-center rounded-full outline-none transition"
          aria-label="알림"
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
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

        {notifications.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">알림이 없어요.</div>
        ) : (
          <ul>
            {notifications.map((notification, idx) => {
              const { icon: Icon, color } = typeConfig[notification.type]
              return (
                <li
                  key={notification.id}
                  className={cn(
                    'flex cursor-pointer gap-3 px-4 py-3 transition',
                    'hover:bg-muted/60',
                    idx !== notifications.length - 1 && 'border-border/40 border-b',
                    !notification.read && 'bg-primary/5',
                  )}
                  onClick={() =>
                    setNotifications((prev) =>
                      prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)),
                    )
                  }
                >
                  <div className={cn('mt-0.5 shrink-0', color)}>
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        notification.type === 'analysis_in_progress' && 'animate-spin',
                      )}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{notification.title}</p>
                      {!notification.read && (
                        <span className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                      )}
                    </div>
                    <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">
                      {notification.description}
                    </p>
                    <p className="text-muted-foreground/70 mt-1 text-[11px]">{notification.time}</p>
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
