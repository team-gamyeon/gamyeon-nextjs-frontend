'use client'

import { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { Bell } from 'lucide-react'
import { NotifItem } from '@/featured/notif/components/NotifItem'
import { MOCK_NOTIFS } from '@/featured/notif/constants'
import type { Notif } from '@/featured/notif/types'

export function NotificationButton() {
  const [notifs, setNotifs] = useState<Notif[]>(MOCK_NOTIFS)
  const unreadCount = notifs.filter((notif) => !notif.isRead).length

  const markAllRead = () => {
    setNotifs((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
  }

  const markAsRead = (selectedNotif: Notif) => {
    setNotifs((prev) =>
      prev.map((notif) =>
        notif.notifId === selectedNotif.notifId ? { ...notif, isRead: true } : notif,
      ),
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          className="text-muted-foreground hover:bg-muted hover:text-foreground relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-colors outline-none"
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
            {notifs.map((notif) => (
              <NotifItem key={notif.notifId} notif={notif} onClick={markAsRead} />
            ))}
          </ul>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
