import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LessonReportUI } from '@/components/teacher/LessonReportUI'

async function getLesson(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('lessons')
    .select('*, student:users!student_id(id, full_name), unit:weekly_units(week_number, theme, grammar_focus, vocabulary)')
    .eq('id', id)
    .eq('teacher_id', user.id)
    .single()

  if (!data) return null
  const normalize = (x: any) => Array.isArray(x) ? x[0] : x
  return { ...data, student: normalize(data.student), unit: normalize(data.unit) }
}

export default async function LessonReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lesson = await getLesson(id)
  if (!lesson) notFound()
  return <LessonReportUI lesson={lesson} />
}
