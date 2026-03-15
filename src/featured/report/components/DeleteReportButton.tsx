'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

export function DeleteReportButton() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleDelete = () => {
    // TODO: 실제 삭제 API 연동
    setOpen(false)
    router.push('/history')
  }

  return (
    <>
      <Button
        variant="secondary"
        className="cursor-pointer gap-2 bg-gray-200 text-gray-500 hover:bg-gray-300"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
        삭제
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>면접 기록 삭제</DialogTitle>
            <DialogDescription>
              이 면접 기록을 삭제하면 복구할 수 없습니다. 정말 삭제하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" className="cursor-pointer" onClick={handleDelete}>
              삭제
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
