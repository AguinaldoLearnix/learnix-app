import { getAdminTeachers } from '@/lib/queries/admin'
import { Users, BookOpen, FileText } from 'lucide-react'

export default async function AdminTeachersPage() {
  const teachers = await getAdminTeachers()

  const totalStudents = teachers.reduce((a, t) => a + t.students_count, 0)
  const totalLessons  = teachers.reduce((a, t) => a + t.lessons_this_month, 0)
  const totalPending  = teachers.reduce((a, t) => a + t.pending_reports, 0)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between px-8 border-b shrink-0" style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
        <h1 className="text-white font-medium" style={{ fontSize: 15, letterSpacing: '-0.015em' }}>Professores</h1>
        <span className="text-[12px]" style={{ color: '#555' }}>{teachers.length} professores cadastrados</span>
      </div>

      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users,    label: 'Total de alunos',      value: totalStudents, color: '#60A5FA' },
            { icon: BookOpen, label: 'Aulas este mês',       value: totalLessons,  color: '#A78BFA' },
            { icon: FileText, label: 'Relatórios pendentes', value: totalPending,  color: '#FACC15' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-[16px] p-4 flex items-center gap-4" style={{ background: '#1A1917' }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <p className="text-[22px] font-semibold text-white leading-none" style={{ letterSpacing: '-0.04em' }}>{value}</p>
                <p className="text-[11px] mt-1" style={{ color: '#555' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {teachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24" style={{ color: '#444' }}>
            <Users className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-[14px] font-medium text-white">Nenhum professor cadastrado</p>
            <p className="text-[12px] mt-1">Crie usuários com role "teacher" para que apareçam aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {teachers.map(t => (
              <div key={t.id} className="rounded-[20px] p-5 space-y-4" style={{ background: '#1A1917' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
                    style={{ background: 'rgba(250,204,21,0.15)', color: '#FACC15' }}>
                    {t.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-white truncate" style={{ letterSpacing: '-0.02em' }}>{t.full_name}</p>
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: t.is_available ? '#4ADE80' : '#555' }} />
                    </div>
                    <p className="text-[11px]" style={{ color: '#555' }}>{t.email}</p>
                  </div>
                </div>

                {t.specialties.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {t.specialties.map((s: string) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#888' }}>{s}</span>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Alunos',    value: t.students_count },
                    { label: 'Aulas/mês', value: t.lessons_this_month },
                    { label: 'Pendentes', value: t.pending_reports },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: '#252320' }}>
                      <p className="text-[18px] font-semibold text-white" style={{ letterSpacing: '-0.04em' }}>{value}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: '#555' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button className="rounded-[20px] p-5 flex flex-col items-center justify-center gap-2 min-h-[160px] transition-colors hover:bg-white/5"
              style={{ border: '1px dashed rgba(255,255,255,0.12)', color: '#444' }}>
              <Users className="h-5 w-5" />
              <p className="text-[12px]">Adicionar professor</p>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
