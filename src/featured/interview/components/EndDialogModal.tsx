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
import type { useInterview } from '@/featured/interview/hooks/useInterview'

interface EndDialogProps {
  session: ReturnType<typeof useInterview>
}

export function EndDialogModal({ session }: EndDialogProps) {
  return (
    <Dialog open={session.showEndDialog} onOpenChange={session.setShowEndDialog}>
      <DialogContent className="border-white/10 bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle>정말 면접을 중단하시겠습니까?</DialogTitle>
          <DialogDescription className="text-white/50">
            면접을 중단하면
            <span className="font-semibold text-red-400"> AI 분석 리포트가 생성되지 않습니다.</span>
            <br />
            모든 질문에 답변해야 AI 분석 리포트를 받을 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            className="text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => session.setShowEndDialog(false)}
          >
            계속하기
          </Button>
          <Button variant="destructive" asChild>
            <Link href="/history">면접 중단</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
