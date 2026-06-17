import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { professional_area, language, goal, target_level, deadline_months,
    weekly_frequency, study_time_daily, interests, assessed_level, program } = body

  // Verify user identity via session cookies
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

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: `Não autenticado: ${authError?.message ?? 'sem sessão'}` })
  }

  // Use service role to bypass RLS for data writes
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Update student profile (upsert in case row doesn't exist yet)
  await admin.from('student_profiles').upsert({
    user_id: user.id,
    professional_area,
    language,
    goal,
    target_level,
    current_level: assessed_level,
    onboarding_completed: true,
  }, { onConflict: 'user_id' })

  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(endDate.getMonth() + deadline_months)

  const { data: prog, error: programError } = await admin
    .from('programs')
    .insert({
      student_id: user.id,
      total_weeks: program.total_weeks,
      start_level: assessed_level,
      target_level,
      goal: goal ?? 'professional',
      language: language ?? 'english',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      status: 'active',
    })
    .select('id')
    .single()

  if (programError) return NextResponse.json({ error: `Erro ao criar programa: ${programError.message}` })

  const units = program.units.map((u: any, i: number) => ({
    program_id: prog.id,
    week_number: u.week_number,
    theme: u.theme,
    grammar_focus: u.grammar_focus,
    vocabulary: u.vocabulary,
    can_do_statements: u.can_do_statements,
    pre_lesson_text: u.pre_lesson_text,
    pre_lesson_questions: u.pre_lesson_questions,
    status: i === 0 ? 'active' : 'upcoming',
  }))

  const { error: unitsError } = await admin.from('weekly_units').insert(units)
  if (unitsError) return NextResponse.json({ error: `Erro ao criar semanas: ${unitsError.message}` })

  const res = NextResponse.json({ redirectTo: '/student' })
  pending.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
  return res
}
