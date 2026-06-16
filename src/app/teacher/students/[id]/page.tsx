import { notFound } from 'next/navigation'
import { getStudentDetail } from '@/lib/queries/teacher'
import { StudentDetailUI } from '@/components/teacher/StudentDetailUI'

export default async function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getStudentDetail(id)
  if (!data) notFound()

  return (
    <StudentDetailUI
      studentUserId={id}
      studentUser={data.user}
      profile={data.profile}
      program={data.program}
      snapshots={data.snapshots}
      errors={data.errors}
      lessons={data.lessons}
      nextLesson={data.nextLesson}
      portfolio={data.portfolio}
      aiSessionsWeek={data.aiSessionsWeek}
    />
  )
}
