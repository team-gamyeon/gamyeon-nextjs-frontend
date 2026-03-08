import { notFound } from 'next/navigation'
import { DashboardSidebar } from '@/shared/components/dashboard-sidebar'
import { NoticeHeader } from '@/featured/notice/components/NoticeHeader'
import { NoticeDetail } from '@/featured/notice/components/NoticeDetail'
import { MOCK_NOTICES } from '@/featured/notice/types'

interface NoticeDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function NoticeDetailPage({ params }: NoticeDetailPageProps) {
  const { id } = await params
  const idx = MOCK_NOTICES.findIndex((n) => n.id === Number(id))

  if (idx === -1) {
    notFound()
  }

  const notice = MOCK_NOTICES[idx]
  const prevNotice = idx > 0 ? MOCK_NOTICES[idx - 1] : null
  const nextNotice = idx < MOCK_NOTICES.length - 1 ? MOCK_NOTICES[idx + 1] : null

  return (
    <div className="bg-muted/20 flex h-screen">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <NoticeHeader />
        <NoticeDetail notice={notice} prevNotice={prevNotice} nextNotice={nextNotice} />
      </main>
    </div>
  )
}
