import { DashboardSidebar } from '@/shared/components/dashboard-sidebar'
import { HistoryHeader } from '@/featured/history/components/HistoryHeader'
import { HistoryClient } from '@/featured/history/components/HistoryClient'

export default function HistoryPage() {
  return (
    <div className="bg-muted/20 flex h-screen">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <HistoryHeader />
        <HistoryClient />
      </main>
    </div>
  )
}
