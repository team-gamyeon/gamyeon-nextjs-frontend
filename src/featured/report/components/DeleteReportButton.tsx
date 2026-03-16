'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { deleteReportAction } from '@/featured/report/actions/report.action'

interface DeleteReportButtonProps {
  intvId: number
}

export function DeleteReportButton({ intvId }: DeleteReportButtonProps) {
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      const res = await deleteReportAction(intvId)

      if (res.success) {
        toast.success('리포트가 성공적으로 삭제되었습니다.')

        setOpen(false)
        router.push('/history')
      } else {
        toast.error('삭제에 실패했습니다. 다시 시도해 주세요.')
      }
    } catch (error) {
      console.error(error)
      toast.error('서버 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
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
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
              취소
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
