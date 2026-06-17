import { createClient } from '@/lib/supabase/server'
import type { StudentDashboard, ErrorBankEntry } from '@/types'

export async function getStudentDashboard(): Promise<StudentDashboard | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Profile
  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Active program
  const { data: program } = await supabase
    .from('programs')
    .select('id, total_weeks, start_date, end_date')
    .eq('student_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  // Active unit
  const { data: currentUnit } = program
    ? await supabase
        .from('weekly_units')
        .select('*')
        .eq('program_id', program.id)
        .eq('status', 'active')
        .order('week_number', { ascending: false })
        .limit(1)
        .single()
    : { data: null }

  // Upcoming lesson
  const { data: upcomingLesson } = await supabase
    .from('lessons')
    .select('*, teacher:users!teacher_id(full_name, avatar_url)')
    .eq('student_id', user.id)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(1)
    .single()

  // Pending tasks
  const { data: pendingTasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('student_id', user.id)
    .in('status', ['pending', 'late'])
    .order('due_at', { ascending: true })

  // Vocabulary total
  const { count: vocabularyTotal } = await supabase
    .from('student_vocabulary')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)

  // Pending vocab reviews — filter through student_vocabulary ownership
  const { data: studentVocabIds } = await supabase
    .from('student_vocabulary').select('id').eq('student_id', user.id)
  const vocabIds = (studentVocabIds ?? []).map((v: any) => v.id)
  const { data: pendingReviews } = vocabIds.length > 0
    ? await supabase
        .from('vocab_reviews')
        .select('id, due_at, vocabulary:student_vocabulary(word, translation)')
        .in('vocabulary_id', vocabIds)
        .is('completed_at', null)
        .lte('due_at', new Date().toISOString())
        .limit(20)
    : { data: [] }

  const pendingVocabReviews = (pendingReviews ?? []).map((r: any) => ({
    id: r.id,
    word: r.vocabulary?.word ?? '',
    translation: r.vocabulary?.translation,
    due_at: r.due_at,
  }))

  // Program progress
  let currentWeek = 1
  if (program?.start_date) {
    const start = new Date(program.start_date)
    const now = new Date()
    const diffWeeks = Math.floor((now.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000))
    currentWeek = Math.max(1, Math.min(diffWeeks + 1, program.total_weeks ?? 24))
  } else if (currentUnit) {
    currentWeek = currentUnit.week_number
  }

  return {
    currentUnit: currentUnit ?? null,
    upcomingLesson: upcomingLesson
      ? {
          ...upcomingLesson,
          teacher: Array.isArray(upcomingLesson.teacher)
            ? upcomingLesson.teacher[0]
            : upcomingLesson.teacher,
        }
      : null,
    pendingTasks: pendingTasks ?? [],
    engagementScore: 0,
    vocabularyTotal: vocabularyTotal ?? 0,
    streak: 0,
    pendingVocabReviews,
    programProgress: {
      currentWeek,
      totalWeeks: program?.total_weeks ?? 24,
    },
  }
}

export async function getStudentSidebarData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users').select('full_name').eq('id', user.id).single()

  const { data: profile } = await supabase
    .from('student_profiles').select('current_level, target_level, language')
    .eq('user_id', user.id).single()

  const { count: vocabularyTotal } = await supabase
    .from('student_vocabulary').select('*', { count: 'exact', head: true }).eq('student_id', user.id)

  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const { count: aiSessionsWeek } = await supabase
    .from('ai_sessions').select('*', { count: 'exact', head: true })
    .eq('student_id', user.id).gte('created_at', weekStart.toISOString())

  // Streak: distinct active days in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data: sessions } = await supabase
    .from('ai_sessions').select('created_at')
    .eq('student_id', user.id)
    .gte('created_at', thirtyDaysAgo.toISOString())

  const activeDays = new Set(
    (sessions ?? []).map((s: any) => s.created_at.slice(0, 10))
  )
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    if (activeDays.has(key)) streak++
    else if (i > 0) break
  }

  return {
    fullName: userData?.full_name ?? '',
    currentLevel: profile?.current_level ?? 'B1',
    targetLevel: profile?.target_level ?? 'B2',
    language: profile?.language ?? 'english',
    vocabularyTotal: vocabularyTotal ?? 0,
    engagementScore: Math.min(100, ((aiSessionsWeek ?? 0) / 5) * 100),
    streak,
  }
}

export async function getStudentProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: profile } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return { user: userData, profile }
}

export async function getErrorBank(): Promise<ErrorBankEntry[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('error_bank')
    .select('*')
    .eq('student_id', user.id)
    .in('status', ['active', 'improving'])
    .order('occurrences', { ascending: false })

  return (data ?? []) as ErrorBankEntry[]
}

export async function getPortfolio() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('portfolio')
    .select('*')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getVocabReviews() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: vocabIds } = await supabase
    .from('student_vocabulary').select('id').eq('student_id', user.id)
  const ids = (vocabIds ?? []).map((v: any) => v.id)
  if (ids.length === 0) return []

  const { data } = await supabase
    .from('vocab_reviews')
    .select('id, due_at, review_number, vocabulary:student_vocabulary(id, word, translation, context_sentence)')
    .in('vocabulary_id', ids)
    .is('completed_at', null)
    .lte('due_at', new Date().toISOString())
    .order('due_at', { ascending: true })
    .limit(30)

  return (data ?? []).map((r: any) => ({
    id: r.id,
    due_at: r.due_at,
    review_number: r.review_number,
    vocabulary_id: r.vocabulary?.id,
    word: r.vocabulary?.word ?? '',
    translation: r.vocabulary?.translation ?? '',
    context_sentence: r.vocabulary?.context_sentence ?? '',
  }))
}

export async function getProgressSnapshots() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('progress_snapshots')
    .select('*')
    .eq('student_id', user.id)
    .order('snapshot_month', { ascending: true })

  return data ?? []
}
