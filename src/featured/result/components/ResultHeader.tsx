import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import Image from 'next/image'
import { Download, Share2 } from 'lucide-react'

export function ResultHeader() {
  return (
    <header className="border-border/50 bg-background/80 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            PDF 저장
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            공유
          </Button>
        </div>
      </div>
    </header>
  )
}
