import { ProcessPipeline } from '@/components/student/ProcessPipeline'
import { WeekHeader } from '@/components/student/WeekHeader'
import { PreLessonSection } from '@/components/student/PreLessonSection'
import { VocabPanel } from '@/components/student/VocabPanel'
import { LessonCard } from '@/components/student/LessonCard'
import { TasksPanel } from '@/components/student/TasksPanel'
import { VocabReviewMini } from '@/components/student/VocabReviewMini'
import { getStudentDashboard, getStudentProfile } from '@/lib/queries/student'
import { createClient } from '@/lib/supabase/server'

export default async function StudentHomePage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  const [dashboard, profileData] = await Promise.all([
    getStudentDashboard(),
    getStudentProfile(),
  ])

  const currentUnit = dashboard?.currentUnit ?? null
  const upcomingLesson = dashboard?.upcomingLesson ?? null
  const pendingTasks = dashboard?.pendingTasks ?? []
  const vocabularyTotal = dashboard?.vocabularyTotal ?? 0
  const pendingVocabReviews = dashboard?.pendingVocabReviews ?? []
  const programProgress = dashboard?.programProgress ?? { currentWeek: 1, totalWeeks: 24 }

  const user = profileData?.user  // user record from 'users' table
  const profile = profileData?.profile

  if (!currentUnit) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: '#555' }}>
        <p className="text-[15px] font-medium text-white">Nenhum programa ativo</p>
        <p className="text-[13px]">Seu professor irá configurar seu programa em breve.</p>
      </div>
    )
  }

  // Check pre-lesson completion for current unit
  const { count: vocabViewedCount } = await supabase
    .from('student_vocabulary')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', authUser!.id)
    .eq('unit_id', currentUnit.id)

  const { data: submittedPreTask } = await supabase
    .from('tasks')
    .select('id')
    .eq('student_id', authUser!.id)
    .eq('unit_id', currentUnit.id)
    .eq('status', 'submitted')
    .limit(1)

  const preLessonStatus = {
    vocabularyViewed: (vocabViewedCount ?? 0) > 0,
    textViewed: false,
    audioViewed: false,
    preLessonTaskDone: (submittedPreTask?.length ?? 0) > 0,
  }

  const firstName = user?.full_name?.split(' ')[0] ?? 'Aluno'
  const currentLevel = profile?.current_level ?? 'B1'
  const targetLevel = profile?.target_level ?? 'B2'
  const language = profile?.language === 'spanish' ? 'Espanhol' : 'Inglês'
  const planMap: Record<string, string> = { light: 'Light', standard: 'Standard', intensive: 'Intensive', turbo: 'Turbo' }
  const planLabel = profile?.plan_type ? (planMap[profile.plan_type] ?? 'Standard') : 'Standard'

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-8 border-b"
        style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-3">
          <p
            className="text-[13px] font-medium text-white"
            style={{ letterSpacing: '-0.013em' }}
          >
            Olá, {firstName}
          </p>
          <span
            className="text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#666' }}
          >
            {currentLevel} → {targetLevel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px]" style={{ color: '#555' }}>
            {language} · Plano {planLabel}
          </span>
        </div>
      </div>

      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

        {/* Process pipeline — full width */}
        <ProcessPipeline currentStep={3} />

        {/* Two-column dashboard */}
        <div className="grid grid-cols-[1fr_300px] gap-5 items-start">

          {/* ── Left column ──────────────────────────── */}
          <div className="space-y-5">
            {/* Week header with circular progress + can-do */}
            <WeekHeader
              weekNumber={programProgress.currentWeek}
              totalWeeks={programProgress.totalWeeks}
              theme={currentUnit.theme}
              grammarFocus={currentUnit.grammar_focus}
              canDoStatements={currentUnit.can_do_statements}
            />

            {/* Pre-lesson checklist */}
            <PreLessonSection unit={currentUnit} status={preLessonStatus} />

            {/* Vocabulary chips */}
            <VocabPanel
              vocabulary={currentUnit.vocabulary}
              totalLearned={vocabularyTotal}
            />
          </div>

          {/* ── Right column ─────────────────────────── */}
          <div className="space-y-4">
            {/* Upcoming lesson — violet spotlight */}
            {upcomingLesson && <LessonCard lesson={upcomingLesson} />}

            {/* Pending tasks */}
            <TasksPanel tasks={pendingTasks} />

            {/* Vocab review — coral spotlight */}
            <VocabReviewMini reviews={pendingVocabReviews} />
          </div>
        </div>
      </div>
    </div>
  )
}
