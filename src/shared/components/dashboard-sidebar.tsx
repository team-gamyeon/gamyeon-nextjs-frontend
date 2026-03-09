'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  House,
  LayoutDashboard,
  Video,
} from 'lucide-react'

const navItems = [
  { icon: House, label: '랜딩 페이지', href: '/' },
  { icon: LayoutDashboard, label: '대시보드', href: '/dashboard' },
  { icon: Video, label: '면접 시작', href: '/interview' },
  { icon: ClipboardList, label: '면접 기록', href: '/history' },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 232 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="border-border/50 bg-background relative flex h-screen shrink-0 flex-col overflow-hidden border-r"
    >
      <div
        className={`border-border/50 flex h-16 shrink-0 items-center border-b ${
          collapsed ? 'justify-center px-0' : 'justify-between px-4'
        }`}
      >
        <AnimatePresence initial={false} mode="wait">
          {collapsed ? (
            <motion.div
              key="icon-only"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Link href="/dashboard" aria-label="대시보드로 이동">
                <Image
                  src="/images/Gamyeon_Logo.svg"
                  alt="Gamyeon logo"
                  width={1024}
                  height={768}
                  style={{ height: '32px', width: 'auto' }}
                />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center"
            >
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/images/Gamyeon_Logo.svg"
                  alt="Gamyeon logo"
                  width={1024}
                  height={768}
                  style={{ height: '32px', width: 'auto' }}
                />
                <span className="text-primary text-lg font-bold tracking-tight">amyeon</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
            aria-label="사이드바 접기"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="border-border/50 flex justify-center border-b py-2">
          <button
            onClick={() => setCollapsed(false)}
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
            aria-label="사이드바 펼치기"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navItems.map((item) => {
          const active = pathname === item.href

          const linkEl = (
            <Link
              href={item.href}
              className={`flex items-center rounded-xl text-sm font-medium transition-colors ${
                collapsed ? 'h-10 w-full justify-center' : 'gap-3 px-3 py-2.5'
              } ${
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.16 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            )
          }

          return <div key={item.href}>{linkEl}</div>
        })}
      </nav>

    </motion.aside>
  )
}
