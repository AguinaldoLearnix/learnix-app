import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { getAdminMetrics } from '@/lib/queries/admin'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const metrics = await getAdminMetrics()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0C0B0A' }}>
      <AdminSidebar metrics={metrics ?? {
        totalStudents: 0, totalTeachers: 0, activeSubscriptions: 0,
        trialUsers: 0, aiSessionsToday: 0, lessonsToday: 0, pendingReports: 0,
      }} />
      <div className="flex-1 ml-[220px] flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
