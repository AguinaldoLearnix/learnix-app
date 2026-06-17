import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PreLessonUI } from '@/components/student/PreLessonUI'

async function getCurrentUnit() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: program } = await supabase
    .from('programs')
    .select('id')
    .eq('student_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!program) return null

  const { data: unit } = await supabase
    .from('weekly_units')
    .select('*')
    .eq('program_id', program.id)
    .eq('status', 'active')
    .order('week_number', { ascending: false })
    .limit(1)
    .single()

  return unit ?? null
}

export default async function PreLessonPage() {
  const unit = await getCurrentUnit()
  if (!unit) notFound()
  return <PreLessonUI unit={unit} />
}
