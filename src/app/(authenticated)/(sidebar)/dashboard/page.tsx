import { DashboardHeader } from '@/featured/dashboard/components/DashboardHeader'
import { QuickStartSection } from '@/featured/dashboard/components/QuickStartSection'
import { StatusSection } from '@/featured/dashboard/components/StatusSection'
import { RecentHistorySection } from '@/featured/dashboard/components/RecentHistorySection'
import { NoticeSection } from '@/featured/dashboard/components/NoticeSection'

export default function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <div className="space-y-6 px-8 py-6">
        <QuickStartSection />
        <StatusSection />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <RecentHistorySection />
          <NoticeSection />
        </div>
      </div>
    </>
  )
}
