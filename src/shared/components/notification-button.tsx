'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'
import { Bell } from 'lucide-react'
import { NotifList } from '@/featured/notif/components/NotifList'
import { MOCK_NOTIFS } from '@/featured/notif/constants'
import type { Notif } from '@/featured/notif/types'

export function NotificationButton() {
  const router = useRouter()
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

  const handleNotifClick = (notif: Notif) => {
    markAsRead(notif)

    switch (notif.notifType) {
      case 'NOTICE':
        router.push('/notices')
        break
      case 'REPORT_SUCCESS':
        router.push(`/report/${notif.targetId}`)
        break
      case 'REPORT_PROCESSING':
      case 'REPORT_FAILED':
        router.push('/history')
        break
    }
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
        <NotifList notifs={notifs} onNotifClick={handleNotifClick} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
