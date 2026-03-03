import { DashboardSidebar } from '@/shared/components/dashboard-sidebar'
import { UploadHeader } from '@/featured/upload/components/UploadHeader'
import { FileUploadZone } from '@/featured/upload/components/FileUploadZone'

export default function UploadPage() {
  return (
    <div className="bg-muted/20 flex h-screen">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <UploadHeader />
        <div className="mx-auto max-w-2xl px-6 py-8">
          <FileUploadZone />
        </div>
      </main>
    </div>
  )
}
