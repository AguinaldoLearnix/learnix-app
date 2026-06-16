import { createClient } from '@/lib/supabase/server'
import { BookOpen, Users, Calendar, Zap } from 'lucide-react'

async function getPrograms() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('programs')
    .select(`
      id, language, start_level, target_level, total_weeks, goal,
      professional_area, status, start_date, end_date, created_at,
      student:users!student_id(id, full_name, email),
      teacher:users!teacher_id(id, full_name),
      weekly_units(id, status)
    `)
    .order('created_at', { ascending: false })

  return (data ?? []).map((p: any) => {
    const units: any[] = Array.isArray(p.weekly_units) ? p.weekly_units : []
    const completedWeeks = units.filter((u: any) => u.status === 'completed').length
    const progressPct    = Math.round((completedWeeks / (p.total_weeks || 1)) * 100)
    return {
      ...p,
      student: Array.isArray(p.student) ? p.student[0] : p.student,
      teacher: Array.isArray(p.teacher) ? p.teacher[0] : p.teacher,
      completedWeeks,
      progressPct,
    }
  })
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  active:    { bg: 'rgba(74,222,128,0.12)',   text: '#4ADE80', label: 'Ativo' },
  completed: { bg: 'rgba(96,165,250,0.12)',   text: '#60A5FA', label: 'Concluído' },
  cancelled: { bg: 'rgba(239,68,68,0.12)',    text: '#F87171', label: 'Cancelado' },
}

export default async function AdminProgramsPage() {
  const programs = await getPrograms()

  const active    = programs.filter(p => p.status === 'active').length
  const completed = programs.filter(p => p.status === 'completed').length

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 border-b shrink-0"
        style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
        <h1 className="text-white font-medium" style={{ fontSize: 15, letterSpacing: '-0.015em' }}>
          Programas
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-[12px]" style={{ color: '#555' }}>
            <span className="text-white font-semibold">{active}</span> ativos · <span className="text-white font-semibold">{completed}</span> concluídos
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Metrics row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total de programas', value: programs.length,        icon: BookOpen, color: '#A78BFA' },
            { label: 'Programas ativos',   value: active,                 icon: Zap,      color: '#4ADE80' },
            { label: 'Concluídos',         value: completed,              icon: Calendar, color: '#60A5FA' },
            { label: 'Alunos com programa',value: new Set(programs.map(p => p.student?.id)).size, icon: Users, color: '#FACC15' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="rounded-[20px] p-5 space-y-2" style={{ background: '#1A1917' }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: '#555' }}>{label}</span>
                <Icon className="h-3.5 w-3.5" style={{ color }} />
              </div>
              <p className="text-[32px] font-medium text-white leading-none" style={{ letterSpacing: '-0.05em' }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Programs table */}
        {programs.length === 0 ? (
          <div className="rounded-[20px] p-12 flex flex-col items-center gap-3 text-center" style={{ background: '#1A1917' }}>
            <BookOpen className="h-8 w-8" style={{ color: '#333' }} />
            <p className="text-[14px] font-medium text-white">Nenhum programa criado ainda</p>
            <p className="text-[12px]" style={{ color: '#555' }}>Professores podem criar programas na página do aluno</p>
          </div>
        ) : (
          <div className="rounded-[20px] overflow-hidden" style={{ background: '#1A1917' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  {['Aluno', 'Professor', 'Idioma', 'Nível', 'Progresso', 'Início', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-medium uppercase tracking-[0.08em]"
                      style={{ color: '#555' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {programs.map((p, i) => {
                  const s = STATUS_STYLE[p.status] ?? STATUS_STYLE.active
                  return (
                    <tr key={p.id}
                      className="border-b transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: i === programs.length - 1 ? 'transparent' : 'rgba(255,255,255,0.04)' }}>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-medium text-white">{p.student?.full_name ?? '—'}</p>
                        <p className="text-[11px] mt-0.5 truncate max-w-[160px]" style={{ color: '#555' }}>{p.student?.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[13px]" style={{ color: '#999' }}>{p.teacher?.full_name ?? '—'}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[12px] px-2 py-0.5 rounded-full capitalize"
                          style={{ background: '#252320', color: '#999' }}>
                          {p.language}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[13px] font-medium" style={{ color: '#A78BFA' }}>
                          {p.start_level} → {p.target_level}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px]" style={{ color: '#555' }}>
                              Sem. {p.completedWeeks}/{p.total_weeks}
                            </span>
                            <span className="text-[11px] font-medium text-white">{p.progressPct}%</span>
                          </div>
                          <div className="h-[3px] rounded-full overflow-hidden w-32" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full" style={{ width: `${p.progressPct}%`, background: '#A78BFA' }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[12px]" style={{ color: '#666' }}>
                          {p.start_date ? new Date(p.start_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-medium px-2.5 py-1 rounded-full"
                          style={{ background: s.bg, color: s.text }}>
                          {s.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
