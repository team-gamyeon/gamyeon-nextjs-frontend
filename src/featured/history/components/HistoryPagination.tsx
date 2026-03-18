import { Button } from '@/shared/ui/button'

interface HistoryPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function HistoryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: HistoryPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="cursor-pointer"
      >
        이전
      </Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'default' : 'outline'}
          size="sm"
          className="h-8 w-8 cursor-pointer p-0"
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="cursor-pointer"
      >
        다음
      </Button>
    </div>
  )
}
