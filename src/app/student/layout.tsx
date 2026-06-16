import { Sidebar } from '@/components/layout/Sidebar'
import { getStudentSidebarData } from '@/lib/queries/student'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const data = await getStudentSidebarData()

  return (
    <div className="min-h-screen flex" style={{ background: '#0C0B0A' }}>
      <Sidebar
        streak={data?.streak ?? 0}
        vocabularyTotal={data?.vocabularyTotal ?? 0}
        engagementScore={Math.round(data?.engagementScore ?? 0)}
        fullName={data?.fullName ?? ''}
        currentLevel={data?.currentLevel ?? 'B1'}
        targetLevel={data?.targetLevel ?? 'B2'}
        language={data?.language ?? 'english'}
      />
      <div className="flex-1 ml-[220px] min-h-screen">
        {children}
      </div>
    </div>
  )
}
