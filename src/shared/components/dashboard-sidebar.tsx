"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useAuthStore } from "@/featured/auth/store";
import {
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  House,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Settings,
  UserCircle2,
  Video,
} from "lucide-react";

const navItems = [
  { icon: House, label: "랜딩 페이지", href: "/" },
  { icon: LayoutDashboard, label: "대시보드", href: "/dashboard" },
  { icon: Video, label: "면접 시작", href: "/interview" },
  { icon: ClipboardList, label: "면접 기록", href: "/history" },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const initials = user?.name ? user.name.slice(0, 1) : "U";

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 232 }}
      transition={{ duration: 0.22, ease: "easeInOut" }}
      className="relative flex h-screen shrink-0 flex-col overflow-hidden border-r border-border/50 bg-background"
    >
      <div
        className={`flex h-16 shrink-0 items-center border-b border-border/50 ${
          collapsed ? "justify-center px-0" : "justify-between px-4"
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
              <Link
                href="/dashboard"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
                aria-label="대시보드로 이동"
              >
                <BrainCircuit className="h-5 w-5 text-primary-foreground" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2.5"
            >
              <Link
                href="/dashboard"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary"
                aria-label="대시보드로 이동"
              >
                <BrainCircuit className="h-5 w-5 text-primary-foreground" />
              </Link>
              <Link
                href="/dashboard"
                className="whitespace-nowrap text-base font-bold leading-none tracking-tight"
              >
                InterviewAI
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="사이드바 접기"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex justify-center border-b border-border/50 py-2">
          <button
            onClick={() => setCollapsed(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="사이드바 펼치기"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-0.5 px-2 py-3">
        {navItems.map((item) => {
          const active = pathname === item.href;

          const linkEl = (
            <Link
              href={item.href}
              className={`flex items-center rounded-xl text-sm font-medium transition-colors ${
                collapsed ? "h-10 w-full justify-center" : "gap-3 px-3 py-2.5"
              } ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.16 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.href}>{linkEl}</div>;
        })}
      </nav>

      <div className="border-t border-border/50 p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="flex w-full items-center justify-center rounded-xl py-2 transition-colors hover:bg-muted">
                    <UserCircle2 className="h-8 w-8 text-primary" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {user?.name ?? "사용자"}
                </TooltipContent>
              </Tooltip>
            ) : (
              <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-muted">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">
                    {user?.name ?? "사용자"}
                  </p>
                  <p className="truncate text-xs leading-tight text-muted-foreground">
                    {user?.email ?? ""}
                  </p>
                </div>
                <MoreHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            <div className="mb-1 border-b border-border/50 px-3 py-2">
              <p className="text-sm font-medium">{user?.name ?? "사용자"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email ?? ""}
              </p>
            </div>
            <DropdownMenuItem className="gap-2">
              <Settings className="h-4 w-4" />
              설정
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
}
