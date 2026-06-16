import { TrendingUp, TrendingDown, Users, BookOpen, Bot, AlertCircle, DollarSign, Activity } from 'lucide-react'
import { getAdminMetrics, getAdminTeachers, getAdminUsers } from '@/lib/queries/admin'

const MONTHLY_REVENUE = [28000, 30500, 31200, 33800, 34900, 38400]
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun']

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  return (
    <div className="flex items-end gap-1 h-10">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${(v / max) * 100}%`,
            background: i === data.length - 1 ? color : `${color}40`,
          }}
        />
      ))}
    </div>
  )
}

export default async function AdminDashboard() {
  const [m, teachers, users] = await Promise.all([
    getAdminMetrics(),
    getAdminTeachers(),
    getAdminUsers(),
  ])
  const atRisk: any[] = []
  const recentUsers = users.filter(u => u.role === 'student').slice(0, 4)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-8 border-b shrink-0"
        style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <h1 className="text-white font-medium" style={{ fontSize: 15, letterSpacing: '-0.015em' }}>
          Dashboard
        </h1>
        <span className="text-[12px]" style={{ color: '#555' }}>Junho 2026</span>
      </div>

      <div className="p-6 space-y-5">

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Receita mensal',    value: `R$ ${(m.revenueMonthly / 1000).toFixed(1)}k`, delta: `+${m.revenueGrowth}%`, up: true,  icon: DollarSign, color: '#4ADE80' },
            { label: 'Assinaturas ativas', value: m.activeSubscriptions,                        delta: `+3 este mês`,          up: true,  icon: Users,      color: '#60A5FA' },
            { label: 'Sessões IA hoje',   value: m.aiSessionsToday,                             delta: `${m.lessonsToday} aulas`, up: true, icon: Bot,       color: '#A78BFA' },
            { label: 'Churn no mês',      value: m.churnedThisMonth,                            delta: '-1 vs. mai',           up: false, icon: TrendingDown, color: '#F87171' },
          ].map(({ label, value, delta, up, icon: Icon, color }) => (
            <div key={label} className="rounded-[16px] p-4 space-y-3" style={{ background: '#1A1917' }}>
              <div className="flex items-center justify-between">
                <p className="text-[11px]" style={{ color: '#555' }}>{label}</p>
                <Icon className="h-3.5 w-3.5" style={{ color }} />
              </div>
              <p className="text-[28px] font-medium leading-none text-white" style={{ letterSpacing: '-0.04em' }}>
                {value}
              </p>
              <div className="flex items-center gap-1">
                {up
                  ? <TrendingUp className="h-3 w-3" style={{ color: '#4ADE80' }} />
                  : <TrendingDown className="h-3 w-3" style={{ color: '#F87171' }} />
                }
                <span className="text-[11px]" style={{ color: up ? '#4ADE80' : '#F87171' }}>{delta}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_300px] gap-5">
          {/* Left */}
          <div className="space-y-5">

            {/* Revenue chart */}
            <div className="rounded-[20px] p-5 space-y-4 card-elevated" style={{ background: '#1A1917' }}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>
                  Receita mensal
                </p>
                <span className="text-[11px]" style={{ color: '#4ADE80' }}>+{m.revenueGrowth}% vs. mai</span>
              </div>
              <MiniBarChart data={MONTHLY_REVENUE} color="#4ADE80" />
              <div className="flex justify-between">
                {MONTHS.map((mo, i) => (
                  <span key={mo} className="text-[10px]" style={{ color: i === MONTHS.length - 1 ? '#FFF' : '#444' }}>
                    {mo}
                  </span>
                ))}
              </div>
            </div>

            {/* Platform activity */}
            <div className="rounded-[20px] p-5 space-y-4 card-elevated" style={{ background: '#1A1917' }}>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>
                Atividade da plataforma · hoje
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Aulas realizadas',    value: m.lessonsToday,      color: '#60A5FA' },
                  { label: 'Sessões com IA',      value: m.aiSessionsToday,   color: '#A78BFA' },
                  { label: 'Relatórios pendentes',value: m.pendingReports,    color: '#FACC15' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-[14px] p-3 text-center" style={{ background: '#252320' }}>
                    <p className="text-[26px] font-medium leading-none" style={{ color, letterSpacing: '-0.04em' }}>
                      {value}
                    </p>
                    <p className="text-[10px] mt-1.5" style={{ color: '#555' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Teachers overview */}
            <div className="rounded-[20px] overflow-hidden card-elevated" style={{ background: '#1A1917' }}>
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>
                  Professores
                </p>
                <a href="/admin/teachers" className="text-[11px]" style={{ color: '#0099FF' }}>
                  Ver todos
                </a>
              </div>
              {(teachers as any[]).map((t: any, i: number) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between px-5 py-3.5"
                  style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold"
                      style={{ background: '#252320', color: '#FFF' }}
                    >
                      {t.full_name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <p className="text-[12px] font-medium text-white">{t.full_name}</p>
                      <p className="text-[10px]" style={{ color: '#555' }}>
                        {t.students_count} alunos · {t.lessons_this_month} aulas/mês
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {t.pending_reports > 0 && (
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(250,204,21,0.12)', color: '#FACC15' }}
                      >
                        {t.pending_reports} pend.
                      </span>
                    )}
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color: t.avg_student_engagement >= 70 ? '#4ADE80' : '#FACC15' }}
                    >
                      {t.avg_student_engagement}%
                    </span>
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: t.is_available ? '#4ADE80' : '#555' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="space-y-4">

            {/* Subscription breakdown */}
            <div className="rounded-[20px] p-5 space-y-4" style={{ background: '#1A1917' }}>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>
                Assinaturas
              </p>
              {[
                { label: 'Ativas',    value: m.activeSubscriptions, color: '#4ADE80', pct: Math.round(m.activeSubscriptions / (m.activeSubscriptions + m.trialUsers) * 100) },
                { label: 'Trial',     value: m.trialUsers,          color: '#60A5FA', pct: Math.round(m.trialUsers / (m.activeSubscriptions + m.trialUsers) * 100) },
                { label: 'Churnadas', value: m.churnedThisMonth,    color: '#F87171', pct: 3 },
              ].map(({ label, value, color, pct }) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px]" style={{ color: '#666' }}>{label}</span>
                    <span className="text-[13px] font-semibold text-white">{value}</span>
                  </div>
                  <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Plan breakdown */}
            <div className="rounded-[20px] p-5 space-y-3" style={{ background: '#1A1917' }}>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>
                Distribuição de planos
              </p>
              {[
                { label: 'Standard',  value: 68, color: '#60A5FA' },
                { label: 'Intensivo', value: 31, color: '#A78BFA' },
                { label: 'Turbo',     value: 18, color: '#F87171' },
                { label: 'Light',     value: 10, color: '#4ADE80' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-[12px]" style={{ color: '#666' }}>{label}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>

            {/* At risk alert */}
            {atRisk.length > 0 && (
              <div
                className="rounded-[20px] p-4 space-y-3"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-3.5 w-3.5" style={{ color: '#F87171' }} />
                  <p className="text-[11px] font-semibold" style={{ color: '#F87171' }}>
                    {atRisk.length} aluno{atRisk.length > 1 ? 's' : ''} em risco
                  </p>
                </div>
                {atRisk.map(u => (
                  <div key={u.id}>
                    <p className="text-[12px] text-white">{u.full_name}</p>
                    <p className="text-[10px]" style={{ color: '#666' }}>{u.teacher} · {u.level}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Engagement avg */}
            <div className="rounded-[20px] p-5 space-y-3" style={{ background: '#1A1917' }}>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>
                Engajamento médio
              </p>
              <p
                className="text-[40px] font-medium leading-none"
                style={{ color: '#A78BFA', letterSpacing: '-0.05em' }}
              >
                {m.avgEngagement}%
              </p>
              <div className="h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: `${m.avgEngagement}%`, background: '#A78BFA' }} />
              </div>
              <p className="text-[11px]" style={{ color: '#555' }}>
                Média de todos os alunos ativos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
