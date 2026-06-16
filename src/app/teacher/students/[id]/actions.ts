'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface WeeklyUnit {
  week_number: number
  theme: string
  grammar_focus: string
  vocabulary: string[]
  expressions?: string[]
  can_do_statements?: string[]
  lesson_objectives?: string[]
}

export async function createProgram(
  studentUserId: string,
  params: {
    language: string
    start_level: string
    target_level: string
    goal: string
    professional_area: string
    total_weeks: number
  },
  units: WeeklyUnit[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + params.total_weeks * 7)

  const { data: program, error: progErr } = await supabase
    .from('programs')
    .insert({
      student_id: studentUserId,
      teacher_id: user.id,
      language: params.language,
      start_level: params.start_level,
      target_level: params.target_level,
      goal: params.goal,
      professional_area: params.professional_area,
      total_weeks: params.total_weeks,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'active',
      generated_by: 'ai',
    })
    .select('id')
    .single()

  if (progErr || !program) return { error: progErr?.message ?? 'Erro ao criar programa' }

  const unitRows = units.map((u, i) => ({
    program_id: program.id,
    week_number: u.week_number,
    theme: u.theme,
    grammar_focus: u.grammar_focus,
    vocabulary: u.vocabulary,
    expressions: u.expressions ?? [],
    can_do_statements: u.can_do_statements ?? [],
    lesson_objectives: u.lesson_objectives ?? [],
    status: i === 0 ? 'active' : 'upcoming',
    available_from: new Date(startDate.getTime() + i * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }))

  const { error: unitErr } = await supabase.from('weekly_units').insert(unitRows)
  if (unitErr) return { error: unitErr.message }

  revalidatePath(`/teacher/students/${studentUserId}`)
  return { success: true, programId: program.id }
}

export async function scheduleLesson(data: {
  studentUserId: string
  unitId?: string
  scheduledAt: string
  durationMin: number
  meetUrl?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('lessons').insert({
    teacher_id: user.id,
    student_id: data.studentUserId,
    unit_id: data.unitId || null,
    scheduled_at: data.scheduledAt,
    duration_min: data.durationMin,
    meet_url: data.meetUrl || null,
    status: 'scheduled',
  })

  if (error) return { error: error.message }

  revalidatePath(`/teacher/students/${data.studentUserId}`)
  revalidatePath('/teacher')
  return { success: true }
}

export async function saveLesonReport(lessonId: string, data: {
  performance: string
  vocabulary_covered: string[]
  feedback_summary: string
  next_lesson_note: string
  errors_logged: object[]
  task?: { type: string; instruction: string; dueDays: number } | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Mark lesson completed
  await supabase.from('lessons').update({ status: 'completed' }).eq('id', lessonId).eq('teacher_id', user.id)

  const { error } = await supabase.from('lesson_reports').upsert({
    lesson_id: lessonId,
    performance: data.performance,
    vocabulary_covered: data.vocabulary_covered,
    feedback_summary: data.feedback_summary,
    next_lesson_note: data.next_lesson_note,
    errors_logged: data.errors_logged,
    lesson_date: new Date().toISOString().split('T')[0],
  }, { onConflict: 'lesson_id' })

  if (error) return { error: error.message }

  const { data: lesson } = await supabase
    .from('lessons').select('student_id, unit_id').eq('id', lessonId).single()

  if (lesson) {
    // Add errors to error_bank
    if (data.errors_logged.length > 0) {
      const bankRows = (data.errors_logged as any[]).map(e => ({
        student_id: lesson.student_id,
        category: e.category,
        description: e.description,
        example: e.example ?? null,
        correction: e.correction ?? null,
        lesson_id: lessonId,
        source: 'teacher',
      }))
      await supabase.from('error_bank').insert(bankRows)
    }

    // Create task if provided
    if (data.task?.instruction?.trim()) {
      const dueAt = new Date()
      dueAt.setDate(dueAt.getDate() + (data.task.dueDays ?? 5))
      await supabase.from('tasks').insert({
        lesson_id: lessonId,
        unit_id: lesson.unit_id ?? null,
        student_id: lesson.student_id,
        type: data.task.type,
        instruction: data.task.instruction,
        due_at: dueAt.toISOString(),
        status: 'pending',
      })
    }
  }

  revalidatePath('/teacher')
  revalidatePath('/teacher/pending')
  return { success: true }
}
