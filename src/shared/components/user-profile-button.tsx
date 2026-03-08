'use client'

import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { useAuthStore } from '@/featured/auth/store'
import { LogOut, Settings } from 'lucide-react'

export function UserProfileButton() {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const initials = user?.name ? user.name.slice(0, 1) : 'U'

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button className="ring-primary/40 flex items-center gap-2.5 rounded-full px-1 py-1 pr-3 outline-none transition hover:ring-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user?.name ?? '사용자'}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="border-border/50 mb-1 border-b px-3 py-2">
          <p className="text-sm font-medium">{user?.name ?? '사용자'}</p>
          <p className="text-muted-foreground truncate text-xs">{user?.email ?? ''}</p>
        </div>
        <DropdownMenuItem className="gap-2">
          <Settings className="h-4 w-4" />
          설정
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive gap-2"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
