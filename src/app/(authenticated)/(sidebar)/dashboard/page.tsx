// src/app/dashboard/page.tsx
import { DashboardHeader } from '@/featured/dashboard/components/DashboardHeader'
import { QuickStartSection } from '@/featured/dashboard/components/QuickStartSection'
import { StatusSection } from '@/featured/dashboard/components/StatusSection'
import { RecentHistorySection } from '@/featured/dashboard/components/RecentHistorySection'
import { NoticeSection } from '@/featured/dashboard/components/NoticeSection'
import { getReportListAction } from '@/featured/history/actions/history.action'

export default async function DashboardPage() {
  const response = await getReportListAction()

  // API가 성공하면 데이터를, 아니면 빈 배열을 기본으로 합니다.
  const history = response.success && response.data ? response.data : []

  return (
    <>
      <DashboardHeader />
      <div className="space-y-6 px-8 py-4">
        <QuickStartSection />
        <StatusSection history={history} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* history 에러 수정해야함 */}
          <RecentHistorySection history={history} />
          <NoticeSection />
        </div>
      </div>
    </>
  )
}
