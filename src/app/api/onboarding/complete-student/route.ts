import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { professional_area, language, goal, target_level, deadline_months,
    weekly_frequency, study_time_daily, interests, assessed_level, program } = body

  const pending: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            pending.push({ name, value, options: options as Record<string, unknown> })
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' })

  await supabase.from('student_profiles').update({
    professional_area,
    language,
    goal,
    target_level,
    current_level: assessed_level,
    onboarding_completed: true,
  }).eq('user_id', user.id)

  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + deadline_months)

  const { data: prog, error: programError } = await supabase
    .from('programs')
    .insert({
      student_id: user.id,
      title: program.title,
      description: program.description,
      total_weeks: program.total_weeks,
      start_level: assessed_level,
      target_level,
      language: language ?? 'english',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'active',
      created_by: user.id,
    })
    .select('id')
    .single()

  if (programError) return NextResponse.json({ error: programError.message })

  const units = program.units.map((u: any, i: number) => ({
    program_id: prog.id,
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
  if (unitsError) return NextResponse.json({ error: unitsError.message })

  const res = NextResponse.json({ redirectTo: '/student' })
  pending.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
  return res
}
