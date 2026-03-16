'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/ui/button'
import { AlertTriangle } from 'lucide-react'

interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const router = useRouter()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">오류가 발생했습니다</h1>
        <p className="text-sm text-muted-foreground">
          {error.message || '일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'}
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60">오류 코드: {error.digest}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => router.push('/')}>
          홈으로
        </Button>
        <Button onClick={reset}>다시 시도</Button>
      </div>
    </div>
  )
}
