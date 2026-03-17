'use client'

import { HeaderActions } from '@/shared/components/header-actions'

export function NoticeHeader() {
  return (
    <div className="border-border/50 bg-background/80 flex items-center justify-between border-b px-8 py-5 backdrop-blur">
      <div>
        <h1 className="text-xl font-bold">공지사항</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          가상 면접 AI 서비스의 새로운 소식과 유용한 정보를 확인해 보세요.
        </p>
      </div>
      <HeaderActions />
    </div>
  )
}
