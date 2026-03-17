import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
        <FileQuestion className="text-muted-foreground h-8 w-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-foreground text-2xl font-semibold">페이지를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground text-sm">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
      </div>

      <Button asChild>
        <Link href="/">랜딩 페이지</Link>
      </Button>
    </div>
  )
}
