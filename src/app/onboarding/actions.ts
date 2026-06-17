'use server'

import { createClient } from '@/lib/supabase/server'

interface OnboardingData {
  professional_area: string
  language: string
  goal: string
  target_level: string
  deadline_months: number
  weekly_frequency: number
  study_time_daily: number
  interests: string
  assessed_level: string
  program: {
    title: string
    description: string
    total_weeks: number
    units: Array<{
      week_number: number
      theme: string
      grammar_focus: string
      vocabulary: string[]
      can_do_statements: string[]
      pre_lesson_text: string
      pre_lesson_questions: string[]
    }>
  }
}

export async function completeStudentOnboarding(data: OnboardingData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // Update student profile
  await supabase.from('student_profiles').update({
    professional_area: data.professional_area,
    language: data.language,
    goal: data.goal,
    target_level: data.target_level,
    current_level: data.assessed_level,
    onboarding_completed: true,
  }).eq('user_id', user.id)

  // Create program
  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + data.deadline_months)

  const { data: program, error: programError } = await supabase
    .from('programs')
    .insert({
      student_id: user.id,
      title: data.program.title,
      description: data.program.description,
      total_weeks: data.program.total_weeks,
      start_level: data.assessed_level,
      target_level: data.target_level,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      created_by: user.id,
    })
    .select('id')
    .single()

  if (programError) return { error: programError.message }

  // Create weekly units
  const units = data.program.units.map((u, i) => ({
    program_id: program.id,
    week_number: u.week_number,
    theme: u.theme,
    grammar_focus: u.grammar_focus,
    vocabulary: u.vocabulary,
    can_do_statements: u.can_do_statements,
    pre_lesson_text: u.pre_lesson_text,
    pre_lesson_questions: u.pre_lesson_questions,
    status: i === 0 ? 'active' : 'locked',
  }))

  const { error: unitsError } = await supabase.from('weekly_units').insert(units)
  if (unitsError) return { error: unitsError.message }

  return { redirectTo: '/student' }
}

export async function completeTeacherOnboarding(data: {
  languages: string[]
  specialties: string[]
  bio: string
  rate_per_hour: number
  max_students: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('teacher_profiles').upsert({
    user_id: user.id,
    languages: data.languages,
    specialties: data.specialties,
    bio: data.bio,
    rate_per_hour: data.rate_per_hour,
    max_students: data.max_students,
  }, { onConflict: 'user_id' })

  if (error) return { error: error.message }
  return { redirectTo: '/teacher' }
}
