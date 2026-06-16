'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, LayoutDashboard, Users, Clock, Settings, LogOut } from 'lucide-react'
import { logout } from '@/app/auth/actions'

const NAV = [
  { href: '/teacher',          label: 'Hoje',    icon: LayoutDashboard },
  { href: '/teacher/students', label: 'Alunos',  icon: Users },
  { href: '/teacher/pending',  label: 'Pendentes', icon: Clock },
]

interface Props {
  teacher: { full_name: string; students_count: number; pending_reports: number }
}

export function TeacherSidebar({ teacher }: Props) {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-30"
      style={{ width: 220, background: '#0C0B0A', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: '#FFFFFF' }}
        >
          <GraduationCap className="h-4 w-4" style={{ color: '#0C0B0A' }} />
        </div>
        <span
          className="font-semibold text-white"
          style={{ fontSize: 15, letterSpacing: '-0.025em' }}
        >
          Learnix
        </span>
      </div>

      {/* Role badge */}
      <div className="px-4 mb-3">
        <span
          className="text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-[0.08em]"
          style={{ background: 'rgba(250,204,21,0.12)', color: '#FACC15' }}
        >
          Professor
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/teacher' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors relative"
              style={{
                background: active ? '#1A1917' : 'transparent',
                color: active ? '#FFFFFF' : '#666',
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {label === 'Pendentes' && teacher.pending_reports > 0 && (
                <span
                  className="ml-auto text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: '#F87171', color: '#FFF' }}
                >
                  {teacher.pending_reports}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Stats */}
      <div
        className="mx-3 mb-3 rounded-xl p-3 space-y-2"
        style={{ background: '#1A1917' }}
      >
        <p className="text-[10px] uppercase tracking-[0.08em]" style={{ color: '#555' }}>
          Esta semana
        </p>
        {[
          { label: 'Alunos ativos', value: teacher.students_count },
          { label: 'Aulas realizadas', value: 7 },
          { label: 'Relatórios', value: `${teacher.students_count - teacher.pending_reports}/${teacher.students_count}` },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: '#555' }}>{label}</span>
            <span className="text-[12px] font-semibold text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* Profile */}
      <div
        className="flex items-center gap-3 px-4 py-4 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
          style={{ background: '#FACC15', color: '#0C0B0A' }}
        >
          {teacher.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-white truncate" style={{ letterSpacing: '-0.012em' }}>
            {teacher.full_name}
          </p>
          <p className="text-[10px]" style={{ color: '#555' }}>Professor</p>
        </div>
        <form action={logout}>
          <button type="submit" className="p-1 rounded-lg hover:bg-white/[0.06] transition-colors">
            <LogOut className="h-3.5 w-3.5" style={{ color: '#444' }} />
          </button>
        </form>
      </div>
    </aside>
  )
}
