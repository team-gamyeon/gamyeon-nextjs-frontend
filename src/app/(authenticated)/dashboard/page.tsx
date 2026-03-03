import { DashboardSidebar } from '@/shared/components/dashboard-sidebar'
import { DashboardHeader } from '@/featured/dashboard/components/DashboardHeader'
import { QuickStartSection } from '@/featured/dashboard/components/QuickStartSection'
import { StatusSection } from '@/featured/dashboard/components/StatusSection'
import { RecentHistorySection } from '@/featured/dashboard/components/RecentHistorySection'

export default function DashboardPage() {
  return (
    <div className="bg-muted/20 flex h-screen">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <DashboardHeader />

        <div className="space-y-6 px-8 py-6">
          <QuickStartSection />
          <StatusSection />
          <RecentHistorySection />
        </div>
      </main>
    </div>
  )
}
