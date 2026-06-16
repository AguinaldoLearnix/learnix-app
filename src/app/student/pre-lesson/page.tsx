import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PreLessonUI } from '@/components/student/PreLessonUI'

async function getCurrentUnit() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*, program:programs(id)')
    .eq('user_id', user.id)
    .single()

  const program = Array.isArray(profile?.program) ? profile.program[0] : profile?.program
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
