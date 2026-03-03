"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useAuthStore } from "@/featured/auth/store";
import {
  Menu,
  BrainCircuit,
  Play,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";

const navLinks = [
  { href: "#features", label: "주요 기능" },
  { href: "#how-it-works", label: "이용 방법" },
  { href: "#testimonials", label: "후기" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
    setIsOpen(false);
  };

  const initials = user?.name ? user.name.slice(0, 1) : "U";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* 로고 */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BrainCircuit className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">가상면접</span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 데스크탑 우측 버튼 영역 */}
        <div className="hidden items-center gap-3 md:flex">
          {isLoggedIn ? (
            <>
              <Button variant="default" size="sm" className="gap-1.5" asChild>
                <Link href="/dashboard">
                  <Play className="h-3.5 w-3.5" />
                  면접 시작하기
                </Link>
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full outline-none ring-primary/40 transition hover:ring-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" />
                      대시보드
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    설정
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/signin">로그인</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
            </>
          )}
        </div>

        {/* 모바일 햄버거 메뉴 */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="mt-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-foreground"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-3">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                    <Button asChild onClick={() => setIsOpen(false)}>
                      <Link href="/dashboard" className="gap-2">
                        <Play className="h-4 w-4" />
                        면접 시작하기
                      </Link>
                    </Button>
                    <Button variant="outline" className="gap-2 text-destructive" onClick={handleLogout}>
                      <LogOut className="h-4 w-4" />
                      로그아웃
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/signin" onClick={() => setIsOpen(false)}>로그인</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>무료로 시작하기</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
}
