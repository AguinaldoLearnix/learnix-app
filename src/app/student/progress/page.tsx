import { TrendingUp, BookOpen, CheckCircle2, Zap, Calendar } from 'lucide-react'
import { SkillBar } from '@/components/student/progress/SkillBar'
import { LineChart } from '@/components/student/progress/LineChart'
import { getProgressSnapshots, getStudentProfile } from '@/lib/queries/student'
import { createClient } from '@/lib/supabase/server'

const SKILLS = [
  { key: 'speaking'  as const, label: 'Speaking',         color: '#A78BFA' },
  { key: 'listening' as const, label: 'Listening',        color: '#60A5FA' },
  { key: 'reading'   as const, label: 'Reading',          color: '#4ADE80' },
  { key: 'writing'   as const, label: 'Writing',          color: '#FACC15' },
  { key: 'uol'       as const, label: 'Use of Language',  color: '#F87171' },
]

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  const [snapshots, profileData] = await Promise.all([
    getProgressSnapshots(),
    getStudentProfile(),
  ])

  const profile = profileData?.profile

  const mockSnapshots = snapshots.length > 0 ? snapshots : []
  const prev  = mockSnapshots[mockSnapshots.length - 2] ?? { speaking: 0, listening: 0, reading: 0, writing: 0, uol: 0 }
  const curr  = mockSnapshots[mockSnapshots.length - 1] ?? { speaking: 0, listening: 0, reading: 0, writing: 0, uol: 0 }
  const mockCurrentScores = { speaking: curr.speaking, listening: curr.listening, reading: curr.reading, writing: curr.writing, uol: curr.uol }
  const avg   = Math.round(Object.values(mockCurrentScores).reduce((a, b) => a + b, 0) / 5)
  const totalLessons = mockSnapshots.reduce((a, s) => a + (s.lessons ?? 0), 0)
  const totalAI      = mockSnapshots.reduce((a, s) => a + (s.ai_sessions ?? 0), 0)
  const currentLevel = profile?.current_level ?? profileData?.user?.role ?? 'B1'
  const targetLevel  = profile?.target_level ?? 'B2'

  // Real counts
  const { data: myTaskIds } = await supabase
    .from('tasks').select('id').eq('student_id', authUser!.id)
  const taskIds = (myTaskIds ?? []).map((t: any) => t.id)
  const [{ count: tasksSubmitted }, { count: vocabTotal }] = await Promise.all([
    taskIds.length > 0
      ? supabase.from('task_submissions').select('*', { count: 'exact', head: true }).in('task_id', taskIds)
      : Promise.resolve({ count: 0 }),
    supabase.from('student_vocabulary').select('*', { count: 'exact', head: true }).eq('student_id', authUser!.id),
  ])

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-8 border-b shrink-0"
        style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <h1 className="text-white font-medium" style={{ fontSize: 15, letterSpacing: '-0.015em' }}>
          Progresso
        </h1>
        <span
          className="text-[12px] px-3 py-1 rounded-full"
          style={{ background: '#1A1917', color: '#999' }}
        >
          {currentLevel} → {targetLevel} · {profile?.language === 'spanish' ? 'Espanhol' : 'Inglês'}
        </span>
      </div>

      <div className="flex flex-1 gap-5 p-6 overflow-hidden">

        {/* ── Left: charts ──────────────────────────────── */}
        <div className="flex-1 space-y-5 overflow-y-auto pr-1">

          {/* Headline stat */}
          <div
            className="rounded-[20px] p-6 space-y-1 gradient-violet"
          >
            <p
              className="text-[11px] font-medium uppercase tracking-[0.08em]"
              style={{ color: 'rgba(255,255,255,0.45)' }}
            >
              Score geral · Junho 2026
            </p>
            <div className="flex items-end gap-4">
              <span
                className="text-white font-medium leading-none"
                style={{ fontSize: 64, letterSpacing: '-0.05em' }}
              >
                {avg}
              </span>
              <div className="mb-2 space-y-0.5">
                <p
                  className="text-[13px] font-medium"
                  style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '-0.013em' }}
                >
                  de 100 pontos
                </p>
                <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.40)' }}>
                  ↑ +{avg - Math.round(Object.values(prev).filter(v => typeof v === 'number').slice(0,5).reduce((a: number, b: number) => a + b, 0) / 5)} desde maio
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap pt-1">
              {SKILLS.map(({ key, label, color }) => (
                <span
                  key={key}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={{ background: 'rgba(255,255,255,0.10)', color: '#FFF' }}
                >
                  {label} {mockCurrentScores[key]}
                </span>
              ))}
            </div>
          </div>

          {/* Line chart */}
          <div
            className="rounded-[20px] p-5 space-y-4 card-elevated"
            style={{ background: '#1A1917' }}
          >
            <div className="flex items-center justify-between">
              <p
                className="text-[11px] font-medium uppercase tracking-[0.08em]"
                style={{ color: '#555' }}
              >
                Evolução por competência
              </p>
              <span className="text-[11px]" style={{ color: '#555' }}>Jan – Jun 2026</span>
            </div>
            <LineChart data={mockSnapshots} />
          </div>

          {/* Skills breakdown */}
          <div
            className="rounded-[20px] p-5 space-y-4 card-elevated"
            style={{ background: '#1A1917' }}
          >
            <p
              className="text-[11px] font-medium uppercase tracking-[0.08em]"
              style={{ color: '#555' }}
            >
              Competências · vs. mês anterior
            </p>
            <div className="space-y-4">
              {SKILLS.map(({ key, label, color }) => (
                <SkillBar
                  key={key}
                  label={label}
                  current={mockCurrentScores[key]}
                  previous={(prev as Record<string, number>)[key]}
                  color={color}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: stats panel ────────────────────────── */}
        <div className="w-[240px] shrink-0 space-y-4">

          {/* Level progress */}
          <div
            className="rounded-[20px] p-5 space-y-3"
            style={{ background: '#1A1917' }}
          >
            <p
              className="text-[10px] font-medium uppercase tracking-[0.08em]"
              style={{ color: '#555' }}
            >
              Nível CEFR
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-[28px] font-medium text-white"
                style={{ letterSpacing: '-0.05em' }}
              >
                {currentLevel}
              </span>
              <div className="text-[12px]" style={{ color: '#555' }}>
                → {targetLevel}
              </div>
            </div>
            <div
              className="h-[4px] rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.round((totalLessons / Math.max(totalLessons + 4, 8)) * 100)}%`, background: '#A78BFA' }}
              />
            </div>
            <p className="text-[11px]" style={{ color: '#555' }}>
              {totalLessons} aulas concluídas · meta {targetLevel}
            </p>
          </div>

          {/* Activity stats */}
          <div
            className="rounded-[20px] p-5 space-y-3"
            style={{ background: '#1A1917' }}
          >
            <p
              className="text-[10px] font-medium uppercase tracking-[0.08em]"
              style={{ color: '#555' }}
            >
              Atividade · semestre
            </p>
            {[
              { icon: Calendar, label: 'Aulas realizadas',  value: totalLessons, color: '#60A5FA' },
              { icon: CheckCircle2, label: 'Tarefas entregues', value: tasksSubmitted ?? 0, color: '#4ADE80' },
              { icon: Zap, label: 'Sessões com IA',         value: totalAI,      color: '#A78BFA' },
              { icon: BookOpen, label: 'Palavras aprendidas', value: vocabTotal ?? 0, color: '#FACC15' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                  <span className="text-[12px]" style={{ color: '#666' }}>{label}</span>
                </div>
                <span
                  className="text-[13px] font-semibold tabular-nums text-white"
                  style={{ letterSpacing: '-0.02em' }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Can-do achieved */}
          <div
            className="rounded-[20px] p-5 space-y-3"
            style={{ background: '#1A1917' }}
          >
            <div className="flex items-center justify-between">
              <p
                className="text-[10px] font-medium uppercase tracking-[0.08em]"
                style={{ color: '#555' }}
              >
                Can-do alcançados
              </p>
              <span className="text-[11px] font-semibold" style={{ color: '#4ADE80' }}>
                18/24
              </span>
            </div>
            <div className="space-y-2">
              {[
                'Apresento minha empresa em inglês',
                'Conduzo reuniões básicas',
                'Escrevo e-mails profissionais',
                'Respondo perguntas em entrevistas',
                'Uso Present Perfect corretamente',
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: i < 4 ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)' }}
                  >
                    {i < 4 && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ADE80' }} />
                    )}
                  </div>
                  <p
                    className="text-[11px] leading-snug"
                    style={{ color: i < 4 ? '#999' : '#444' }}
                  >
                    {s}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly report CTA */}
          <button
            className="flex items-center justify-between w-full px-4 py-3 rounded-full text-[12px] font-medium transition-opacity hover:opacity-80"
            style={{ background: '#FFFFFF', color: '#0C0B0A' }}
          >
            <span>Ver relatório de junho</span>
            <TrendingUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
