import { createClient } from '@/lib/supabase/server'

export async function getTeacherProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
  return data
}

export async function getTodayLessons() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const { data } = await supabase
    .from('lessons')
    .select(`
      *,
      student:users!student_id(id, full_name, email),
      unit:weekly_units(week_number, theme, grammar_focus, vocabulary),
      report:lesson_reports(id)
    `)
    .eq('teacher_id', user.id)
    .eq('status', 'scheduled')
    .gte('scheduled_at', todayStart.toISOString())
    .lte('scheduled_at', todayEnd.toISOString())
    .order('scheduled_at', { ascending: true })

  return (data ?? []).map((l: any) => ({
    ...l,
    student: Array.isArray(l.student) ? l.student[0] : l.student,
    unit: Array.isArray(l.unit) ? l.unit[0] : l.unit,
    pre_lesson_status: { vocabulary_viewed: false, text_viewed: false, audio_viewed: false, task_done: false },
    ai_sessions_week: 0,
    errors_active: 0,
    last_lesson_note: null,
    report_pending: !l.report || l.report.length === 0,
  }))
}

export async function getPendingReportLessons() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('lessons')
    .select(`
      *,
      student:users!student_id(id, full_name, email),
      unit:weekly_units(week_number, theme, grammar_focus, vocabulary),
      report:lesson_reports(id)
    `)
    .eq('teacher_id', user.id)
    .eq('status', 'completed')
    .order('scheduled_at', { ascending: false })

  const withoutReport = (data ?? []).filter((l: any) => !l.report || l.report.length === 0)

  return withoutReport.map((l: any) => ({
    ...l,
    student: Array.isArray(l.student) ? l.student[0] : l.student,
    unit: Array.isArray(l.unit) ? l.unit[0] : l.unit,
    last_lesson_note: null,
  }))
}

export async function getTeacherStudents() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('student_profiles')
    .select(`
      *,
      user:users!user_id(id, full_name, email, avatar_url),
      group:groups(id, name)
    `)
    .eq('teacher_id', user.id)

  return data ?? []
}

export async function getTeacherGroups() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('groups')
    .select(`
      *,
      members:group_members(
        student_id,
        user:users!student_id(id, full_name, email, avatar_url)
      )
    `)
    .eq('teacher_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getTeacherSidebarData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users').select('full_name').eq('id', user.id).single()

  const { count: studentsCount } = await supabase
    .from('student_profiles').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id)

  const { count: pendingReports } = await supabase
    .from('lessons')
    .select('*, report:lesson_reports(id)', { count: 'exact', head: false })
    .eq('teacher_id', user.id)
    .eq('status', 'completed')
    .then(async ({ data }) => {
      const without = (data ?? []).filter((l: any) => !l.report || (Array.isArray(l.report) ? l.report.length === 0 : !l.report))
      return { count: without.length }
    })

  return {
    full_name: userData?.full_name ?? '',
    students_count: studentsCount ?? 0,
    pending_reports: pendingReports ?? 0,
  }
}

export async function getStudentDetail(studentUserId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: studentUser } = await supabase
    .from('users').select('id, full_name, email, avatar_url')
    .eq('id', studentUserId).single()

  const { data: profile } = await supabase
    .from('student_profiles').select('*')
    .eq('user_id', studentUserId).eq('teacher_id', user.id).single()

  if (!profile) return null

  const { data: program } = await supabase
    .from('programs')
    .select('*, weekly_units(id, week_number, theme, grammar_focus, vocabulary, status)')
    .eq('student_id', studentUserId).eq('status', 'active')
    .order('created_at', { ascending: false }).limit(1).maybeSingle()

  const { data: snapshots } = await supabase
    .from('progress_snapshots').select('*')
    .eq('student_id', studentUserId)
    .order('snapshot_month', { ascending: false }).limit(2)

  const { data: errors } = await supabase
    .from('error_bank').select('*')
    .eq('student_id', studentUserId).neq('status', 'resolved')
    .order('last_seen_at', { ascending: false }).limit(10)

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*, unit:weekly_units(week_number, theme), report:lesson_reports(feedback_summary, performance)')
    .eq('student_id', studentUserId).eq('teacher_id', user.id).eq('status', 'completed')
    .order('scheduled_at', { ascending: false }).limit(8)

  const { data: nextLesson } = await supabase
    .from('lessons')
    .select('*, unit:weekly_units(week_number, theme)')
    .eq('student_id', studentUserId).eq('teacher_id', user.id).eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true }).limit(1).maybeSingle()

  const { data: portfolio } = await supabase
    .from('portfolio').select('id, title, type, score, created_at')
    .eq('student_id', studentUserId)
    .order('created_at', { ascending: false }).limit(5)

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const { count: aiSessionsWeek } = await supabase
    .from('ai_sessions').select('*', { count: 'exact', head: true })
    .eq('student_id', studentUserId).gte('created_at', weekStart.toISOString())

  const normalize = (x: any) => Array.isArray(x) ? x[0] : x

  return {
    user: studentUser,
    profile,
    program: program ?? null,
    snapshots: snapshots ?? [],
    errors: errors ?? [],
    lessons: (lessons ?? []).map((l: any) => ({ ...l, unit: normalize(l.unit), report: normalize(l.report) })),
    nextLesson: nextLesson ? { ...nextLesson, unit: normalize(nextLesson.unit) } : null,
    portfolio: portfolio ?? [],
    aiSessionsWeek: aiSessionsWeek ?? 0,
  }
}

export async function getTeacherInvites() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('invites')
    .select('*')
    .eq('teacher_id', user.id)
    .is('used_at', null)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return data ?? []
}
