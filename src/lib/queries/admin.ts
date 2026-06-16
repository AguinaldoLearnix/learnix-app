import { createClient } from '@/lib/supabase/server'

export async function getAdminMetrics() {
  const supabase = await createClient()

  const [
    { count: totalStudents },
    { count: totalTeachers },
    { count: activeSubscriptions },
    { count: trialUsers },
    { count: aiSessionsToday },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
    supabase.from('student_profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active'),
    supabase.from('student_profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'trial'),
    supabase.from('ai_sessions').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
  ])

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const { count: lessonsToday } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .gte('scheduled_at', todayStart.toISOString())

  const { count: pendingReports } = await supabase
    .from('lessons')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed')
    .is('lesson_reports.id', null)

  return {
    totalStudents: totalStudents ?? 0,
    totalTeachers: totalTeachers ?? 0,
    activeSubscriptions: activeSubscriptions ?? 0,
    trialUsers: trialUsers ?? 0,
    aiSessionsToday: aiSessionsToday ?? 0,
    lessonsToday: lessonsToday ?? 0,
    pendingReports: pendingReports ?? 0,
    revenueMonthly: 0,
    revenueGrowth: 0,
    churnedThisMonth: 0,
    avgEngagement: 0,
    totalGroups: 0,
  }
}

export async function getAdminUsers() {
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('users')
    .select('*, student_profile:student_profiles(current_level, plan_type, subscription_status, teacher_id, teacher:users!teacher_id(full_name))')
    .order('created_at', { ascending: false })

  return (users ?? []).map((u: any) => {
    const sp = Array.isArray(u.student_profile) ? u.student_profile[0] : u.student_profile
    return {
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      is_active: u.is_active,
      created_at: u.created_at,
      current_level: sp?.current_level,
      plan_type: sp?.plan_type,
      subscription_status: sp?.subscription_status,
      teacher_name: sp?.teacher?.full_name,
    }
  })
}

export async function getAdminTeachers() {
  const supabase = await createClient()

  const { data: teachers } = await supabase
    .from('users')
    .select(`
      *,
      teacher_profile:teacher_profiles(specialties, is_available),
      students:student_profiles(user_id)
    `)
    .eq('role', 'teacher')
    .order('full_name', { ascending: true })

  const result = await Promise.all(
    (teachers ?? []).map(async (t: any) => {
      const tp = Array.isArray(t.teacher_profile) ? t.teacher_profile[0] : t.teacher_profile

      const { count: lessonsThisMonth } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', t.id)
        .gte('scheduled_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

      const { count: pendingReports } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('teacher_id', t.id)
        .eq('status', 'completed')

      return {
        id: t.id,
        full_name: t.full_name,
        email: t.email,
        avatar_url: t.avatar_url,
        specialties: tp?.specialties ?? [],
        is_available: tp?.is_available ?? true,
        students_count: Array.isArray(t.students) ? t.students.length : 0,
        lessons_this_month: lessonsThisMonth ?? 0,
        pending_reports: pendingReports ?? 0,
        avg_student_engagement: 0,
      }
    })
  )

  return result
}
