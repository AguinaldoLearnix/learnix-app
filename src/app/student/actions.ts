'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitTask(taskId: string, data: {
  contentText?: string
  transcription?: string
  aiFeedback?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error: subErr } = await supabase.from('task_submissions').insert({
    task_id: taskId,
    content_text: data.contentText ?? null,
    transcription: data.transcription ?? null,
    ai_feedback: data.aiFeedback ?? null,
    submitted_at: new Date().toISOString(),
  })
  if (subErr) return { error: subErr.message }

  await supabase.from('tasks').update({ status: 'submitted' }).eq('id', taskId).eq('student_id', user.id)

  revalidatePath('/student')
  return { success: true }
}

export async function markVocabularyViewed(unitId: string, words: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  if (words.length === 0) return { success: true }

  // Upsert words into student_vocabulary
  const rows = words.map(word => ({
    student_id: user.id,
    word,
    unit_id: unitId,
    learned_at: new Date().toISOString(),
  }))

  const { data: inserted, error } = await supabase
    .from('student_vocabulary')
    .upsert(rows, { onConflict: 'student_id,word' })
    .select('id')

  if (error) return { error: error.message }

  // Schedule vocab reviews (SRS intervals: 1, 3, 7, 14, 30 days)
  const SRS_INTERVALS = [1, 3, 7, 14, 30]
  const reviewRows = (inserted ?? []).flatMap((v: any) =>
    SRS_INTERVALS.map((days, i) => {
      const due = new Date()
      due.setDate(due.getDate() + days)
      return { vocabulary_id: v.id, review_number: i + 1, due_at: due.toISOString() }
    })
  )

  if (reviewRows.length > 0) {
    await supabase.from('vocab_reviews').insert(reviewRows)
  }

  revalidatePath('/student')
  return { success: true }
}

export async function addPortfolioItem(data: {
  type: string
  title: string
  transcription?: string
  contentText?: string
  score?: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('portfolio').insert({
    student_id: user.id,
    type: data.type,
    title: data.title || null,
    transcription: data.transcription || data.contentText || null,
    score: data.score ?? null,
    created_at: new Date().toISOString(),
  })

  if (error) return { error: error.message }
  revalidatePath('/student/portfolio')
  return { success: true }
}

export async function completeVocabReview(reviewId: string, score: number) {
  const supabase = await createClient()
  await supabase.from('vocab_reviews')
    .update({ completed_at: new Date().toISOString(), score })
    .eq('id', reviewId)
  revalidatePath('/student')
  return { success: true }
}
