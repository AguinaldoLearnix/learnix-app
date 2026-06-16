import Link from 'next/link'
import { Video, Clock, AlertCircle, Bot, FileText, ChevronRight } from 'lucide-react'
import { getTeacherProfile, getTodayLessons, getPendingReportLessons, getTeacherStudents } from '@/lib/queries/teacher'

function preLessonPct(s: { vocabulary_viewed: boolean; text_viewed: boolean; audio_viewed: boolean; task_done: boolean }) {
  return Math.round([s.vocabulary_viewed, s.text_viewed, s.audio_viewed, s.task_done].filter(Boolean).length / 4 * 100)
}

export default async function TeacherDashboard() {
  const [teacher, todayLessons, pendingReports, students] = await Promise.all([
    getTeacherProfile(),
    getTodayLessons(),
    getPendingReportLessons(),
    getTeacherStudents(),
  ])

  const firstName = teacher?.full_name?.split(' ')[0] ?? 'Professor'
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const todayCapitalized = today.charAt(0).toUpperCase() + today.slice(1)

  const atRisk = students.filter((s: any) => {
    const sp = s.subscription_status
    return sp === 'paused' || sp === 'cancelled'
  })

  const pendingTasks = students.filter((s: any) => s.task_pending)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between px-8 border-b shrink-0" style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
        <h1 className="text-white font-medium" style={{ fontSize: 15, letterSpacing: '-0.015em' }}>
          Olá, {firstName} 👋
        </h1>
        <span className="text-[12px]" style={{ color: '#555' }}>{todayCapitalized}</span>
      </div>

      <div className="p-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Aulas hoje',            value: todayLessons.length,   color: '#60A5FA' },
            { label: 'Relatórios pendentes',  value: pendingReports.length,  color: '#FACC15' },
            { label: 'Alunos',                value: students.length,        color: '#A78BFA' },
            { label: 'Turmas',                value: 0,                      color: '#4ADE80' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-[16px] p-4" style={{ background: '#1A1917' }}>
              <p className="text-[32px] font-medium leading-none" style={{ color, letterSpacing: '-0.05em' }}>{value}</p>
              <p className="text-[11px] mt-2" style={{ color: '#555' }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-5">

          {/* Left column */}
          <div className="space-y-5">

            {/* Today's lessons */}
            <div className="rounded-[20px] overflow-hidden" style={{ background: '#1A1917' }}>
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Aulas de hoje</p>
                <span className="text-[11px]" style={{ color: '#555' }}>
                  {todayLessons.length} agendada{todayLessons.length !== 1 ? 's' : ''}
                </span>
              </div>

              {todayLessons.length === 0 ? (
                <div className="px-5 py-8 text-center" style={{ color: '#444' }}>
                  <Video className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-[13px]">Nenhuma aula hoje</p>
                </div>
              ) : todayLessons.map((lesson: any) => {
                const pct = preLessonPct(lesson.pre_lesson_status)
                const time = new Date(lesson.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                const initials = lesson.student?.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') ?? '?'
                return (
                  <div key={lesson.id} className="px-5 py-4 space-y-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold" style={{ background: '#252320', color: '#FFF' }}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-white" style={{ letterSpacing: '-0.013em' }}>{lesson.student?.full_name}</p>
                          <p className="text-[11px]" style={{ color: '#555' }}>{time} · {lesson.duration_min}min</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/teacher/students/${lesson.student?.id}`}
                          className="px-3 py-1.5 rounded-full text-[11px] font-medium"
                          style={{ background: '#252320', color: '#999' }}>
                          Ver aluno
                        </Link>
                        {lesson.meet_url && (
                          <a href={lesson.meet_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-opacity hover:opacity-80"
                            style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
                            <Video className="h-3 w-3" /> Entrar
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px]" style={{ color: '#555' }}>Pré-aula concluído</span>
                          <span className="text-[10px] font-semibold" style={{ color: pct >= 75 ? '#4ADE80' : pct >= 50 ? '#FACC15' : '#F87171' }}>{pct}%</span>
                        </div>
                        <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 75 ? '#4ADE80' : pct >= 50 ? '#FACC15' : '#F87171' }} />
                        </div>
                      </div>
                      <div className="flex gap-2 text-[10px]" style={{ color: '#555' }}>
                        <span className="flex items-center gap-1"><Bot className="h-3 w-3" /> {lesson.ai_sessions_week}</span>
                        <span className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" style={{ color: lesson.errors_active > 4 ? '#F87171' : '#555' }} />
                          {lesson.errors_active}
                        </span>
                      </div>
                    </div>

                    {lesson.unit && (
                      <div className="rounded-xl px-3 py-2 space-y-0.5" style={{ background: '#252320' }}>
                        <p className="text-[11px] font-medium text-white">Sem. {lesson.unit.week_number} · {lesson.unit.theme}</p>
                        <p className="text-[10px]" style={{ color: '#555' }}>{lesson.unit.grammar_focus}</p>
                        {lesson.last_lesson_note && (
                          <p className="text-[10px] italic mt-1" style={{ color: '#666' }}>📌 {lesson.last_lesson_note}</p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pending reports */}
            {pendingReports.length > 0 && (
              <div className="rounded-[20px] overflow-hidden" style={{ background: '#1A1917', border: '1px solid rgba(250,204,21,0.15)' }}>
                <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#FACC15' }}>Pós-aula pendente</p>
                  <Clock className="h-3.5 w-3.5" style={{ color: '#FACC15' }} />
                </div>
                {pendingReports.map((lesson: any) => {
                  const date = new Date(lesson.scheduled_at)
                  const hoursAgo = Math.floor((Date.now() - date.getTime()) / 3600000)
                  const initials = lesson.student?.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') ?? '?'
                  return (
                    <div key={lesson.id} className="px-5 py-4 flex items-center justify-between border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold" style={{ background: 'rgba(250,204,21,0.12)', color: '#FACC15' }}>
                          {initials}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-white">{lesson.student?.full_name}</p>
                          <p className="text-[11px]" style={{ color: '#555' }}>
                            {date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' })} · {hoursAgo}h atrás
                          </p>
                        </div>
                      </div>
                      <Link href={`/teacher/lessons/${lesson.id}/report`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-opacity hover:opacity-80"
                        style={{ background: '#FACC15', color: '#0C0B0A' }}>
                        <FileText className="h-3 w-3" /> Preencher
                      </Link>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* All students quick view */}
            <div className="rounded-[20px] overflow-hidden" style={{ background: '#1A1917' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Meus alunos</p>
                <Link href="/teacher/students" className="text-[11px]" style={{ color: '#0099FF' }}>Ver todos</Link>
              </div>

              {students.length === 0 ? (
                <div className="px-4 py-6 text-center" style={{ color: '#444' }}>
                  <p className="text-[12px]">Nenhum aluno ainda.</p>
                  <Link href="/teacher/students" className="text-[11px] mt-1 block" style={{ color: '#0099FF' }}>Convidar alunos →</Link>
                </div>
              ) : students.map((s: any, i: number) => (
                <Link key={s.user_id} href={`/teacher/students/${s.user_id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
                  style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0"
                      style={{ background: '#252320', color: '#FFF' }}>
                      {s.user?.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') ?? '?'}
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-white">{s.user?.full_name?.split(' ')[0]}</p>
                      <p className="text-[10px]" style={{ color: '#555' }}>{s.current_level} · {s.language === 'english' ? 'Inglês' : 'Espanhol'}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5" style={{ color: '#333' }} />
                </Link>
              ))}
            </div>

            {/* Pending reports quick link */}
            {pendingReports.length > 0 && (
              <Link href="/teacher/pending"
                className="flex items-center justify-between px-4 py-3 rounded-[16px] transition-opacity hover:opacity-80"
                style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.15)' }}>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" style={{ color: '#FACC15' }} />
                  <span className="text-[12px] font-medium" style={{ color: '#FACC15' }}>
                    {pendingReports.length} pós-aula{pendingReports.length > 1 ? 's' : ''} pendente{pendingReports.length > 1 ? 's' : ''}
                  </span>
                </div>
                <ChevronRight className="h-3.5 w-3.5" style={{ color: '#FACC15' }} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
