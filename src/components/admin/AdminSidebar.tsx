'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GraduationCap, LayoutDashboard, Users, BookOpen, Settings, Shield, LogOut } from 'lucide-react'
import { logout } from '@/app/auth/actions'

const NAV = [
  { href: '/admin',          label: 'Dashboard',  icon: LayoutDashboard, exact: true },
  { href: '/admin/users',    label: 'Usuários',   icon: Users },
  { href: '/admin/teachers', label: 'Professores', icon: BookOpen },
  { href: '/admin/programs', label: 'Programas',  icon: Settings },
]

interface Props {
  metrics: { totalStudents: number; totalTeachers: number; pendingReports: number }
}

export function AdminSidebar({ metrics }: Props) {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-30"
      style={{ width: 220, background: '#0C0B0A', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#FFFFFF' }}>
          <GraduationCap className="h-4 w-4" style={{ color: '#0C0B0A' }} />
        </div>
        <span className="font-semibold text-white" style={{ fontSize: 15, letterSpacing: '-0.025em' }}>
          Learnix
        </span>
      </div>

      {/* Role badge */}
      <div className="px-4 mb-3">
        <span
          className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-[0.08em] w-fit"
          style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171' }}
        >
          <Shield className="h-2.5 w-2.5" />
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
              style={{ background: active ? '#1A1917' : 'transparent', color: active ? '#FFFFFF' : '#666' }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Quick stats */}
      <div className="mx-3 mb-3 rounded-xl p-3 space-y-2" style={{ background: '#1A1917' }}>
        <p className="text-[10px] uppercase tracking-[0.08em]" style={{ color: '#555' }}>Plataforma</p>
        {[
          { label: 'Alunos ativos',  value: metrics.totalStudents },
          { label: 'Professores',    value: metrics.totalTeachers },
          { label: 'Relatórios pend.', value: metrics.pendingReports },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-[11px]" style={{ color: '#555' }}>{label}</span>
            <span className="text-[12px] font-semibold text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* Profile */}
      <div className="flex items-center gap-3 px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0"
          style={{ background: '#F87171', color: '#FFF' }}
        >
          LA
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-medium text-white truncate" style={{ letterSpacing: '-0.012em' }}>Learnix Admin</p>
          <p className="text-[10px]" style={{ color: '#555' }}>admin@learnix.com</p>
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
