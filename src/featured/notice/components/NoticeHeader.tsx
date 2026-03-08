'use client'

export function NoticeHeader() {
  return (
    <div className="border-border/50 bg-background/80 border-b px-8 py-5 backdrop-blur">
      <div>
        <h1 className="text-xl font-bold">공지사항</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          서비스 업데이트, 점검 안내, 이벤트 등 최신 소식을 확인하세요.
        </p>
      </div>
    </div>
  )
}
