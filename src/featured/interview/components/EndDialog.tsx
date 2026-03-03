'use client'

import Link from 'next/link'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/ui/dialog'

interface EndDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EndDialog({ open, onOpenChange }: EndDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle>면접을 종료하시겠습니까?</DialogTitle>
          <DialogDescription className="text-white/60">
            종료하면 현재까지의 답변을 바탕으로 결과 리포트가 생성됩니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            계속하기
          </Button>
          <Button variant="destructive" asChild>
            <Link href="/result">면접 종료</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
