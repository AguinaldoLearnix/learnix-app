import { TeacherSidebar } from '@/components/teacher/TeacherSidebar'
import { getTeacherSidebarData } from '@/lib/queries/teacher'

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const data = await getTeacherSidebarData()

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0C0B0A' }}>
      <TeacherSidebar teacher={{
        full_name: data?.full_name ?? '',
        students_count: data?.students_count ?? 0,
        pending_reports: data?.pending_reports ?? 0,
      }} />
      <div className="flex-1 ml-[220px] flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  )
}
