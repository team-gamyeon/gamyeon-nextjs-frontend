import { DashboardSidebar } from '@/shared/components/dashboard-sidebar'

export default function WithSidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/20 flex h-screen overflow-hidden">
      <DashboardSidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">{children}</main>
    </div>
  )
}
