import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TaskSubmitUI } from '@/components/student/TaskSubmitUI'

async function getTask(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('tasks')
    .select('*, submission:task_submissions(id, content_text, transcription, ai_feedback, submitted_at)')
    .eq('id', id)
    .eq('student_id', user.id)
    .single()

  if (!data) return null
  const sub = Array.isArray(data.submission) ? data.submission[0] : data.submission
  return { ...data, submission: sub ?? null }
}

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const task = await getTask(id)
  if (!task) notFound()
  return <TaskSubmitUI task={task} />
}
