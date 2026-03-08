import { DashboardSidebar } from '@/shared/components/dashboard-sidebar'
import { NoticeHeader } from '@/featured/notice/components/NoticeHeader'
import { NoticeClient } from '@/featured/notice/components/NoticeClient'

export default function NoticePage() {
  return (
    <div className="bg-muted/20 flex h-screen">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <NoticeHeader />
        <NoticeClient />
      </main>
    </div>
  )
}
