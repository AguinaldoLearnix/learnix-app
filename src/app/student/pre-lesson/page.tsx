import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { PreLessonUI } from '@/components/student/PreLessonUI'

function adminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getCurrentUnit() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = adminClient()

  const { data: program } = await admin
    .from('programs')
    .select('id')
    .eq('student_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!program) return null

  const { data: unit } = await admin
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
