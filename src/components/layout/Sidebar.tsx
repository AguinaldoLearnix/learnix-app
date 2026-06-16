'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen, Bot, TrendingUp, AlertCircle, FolderOpen,
  Flame, Brain, GraduationCap, Settings, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/auth/actions'

const navItems = [
  { href: '/student', label: 'Esta semana', icon: BookOpen },
  { href: '/student/practice', label: 'Praticar IA', icon: Bot },
  { href: '/student/progress', label: 'Progresso', icon: TrendingUp },
  { href: '/student/errors', label: 'Error Bank', icon: AlertCircle },
  { href: '/student/portfolio', label: 'Portfólio', icon: FolderOpen },
]

interface SidebarProps {
  streak: number
  vocabularyTotal: number
  engagementScore: number
  fullName: string
  currentLevel: string
  targetLevel: string
  language: string
}

export function Sidebar({ streak, vocabularyTotal, engagementScore, fullName, currentLevel, targetLevel, language }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-[220px] flex flex-col z-30 border-r"
      style={{ background: '#0C0B0A', borderColor: 'rgba(255,255,255,0.07)' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 border-b"
        style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: '#FFFFFF' }}
        >
          <GraduationCap className="h-4 w-4" style={{ color: '#0C0B0A' }} />
        </div>
        <span
          className="font-medium text-white"
          style={{ fontSize: 15, letterSpacing: '-0.02em' }}
        >
          Learnix
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors',
                'text-[13px] font-medium tracking-[-0.013em]',
                active
                  ? 'text-white'
                  : 'text-[#666] hover:text-[#ccc] hover:bg-white/[0.04]'
              )}
              style={active ? { background: '#1A1917', color: '#FFF' } : {}}
            >
              <Icon className="h-[15px] w-[15px] shrink-0" />
              {label}
            </Link>
          )
        })}

        {/* Divider */}
        <div
          className="my-3 mx-1 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        />

        {/* Stats block */}
        <div
          className="rounded-xl p-3 space-y-3"
          style={{ background: '#1A1917' }}
        >
          <p
            className="text-[10px] font-medium uppercase tracking-[0.08em]"
            style={{ color: '#555' }}
          >
            Esta semana
          </p>
          <div className="space-y-2.5">
            <StatRow
              icon={<Flame className="h-3.5 w-3.5" style={{ color: '#FACC15' }} />}
              label="Sequência"
              value={`${streak} dias`}
            />
            <StatRow
              icon={<Brain className="h-3.5 w-3.5" style={{ color: '#A78BFA' }} />}
              label="Vocabulário"
              value={`${vocabularyTotal} palavras`}
            />
            <StatRow
              icon={
                <div
                  className="h-3.5 w-3.5 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{
                    background:
                      engagementScore >= 70
                        ? 'rgba(74,222,128,0.2)'
                        : 'rgba(250,204,21,0.2)',
                    color: engagementScore >= 70 ? '#4ADE80' : '#FACC15',
                  }}
                >
                  %
                </div>
              }
              label="Engajamento"
              value={`${engagementScore}%`}
              valueColor={engagementScore >= 70 ? '#4ADE80' : '#FACC15'}
            />
          </div>
        </div>
      </nav>

      {/* User profile */}
      <div
        className="px-3 py-3 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl group cursor-pointer hover:bg-white/[0.04] transition-colors">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
            style={{ background: '#252320', color: '#FFF' }}
          >
            {fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-white truncate" style={{ letterSpacing: '-0.012em' }}>
              {fullName}
            </p>
            <p className="text-[11px] truncate" style={{ color: '#555' }}>
              {currentLevel} → {targetLevel} · {language === 'spanish' ? 'Espanhol' : 'Inglês'}
            </p>
          </div>
          <Settings className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" style={{ color: '#FFF' }} />
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-[12px] transition-colors hover:bg-white/[0.04]"
            style={{ color: '#555' }}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}

function StatRow({
  icon,
  label,
  value,
  valueColor = '#FFF',
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueColor?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[12px]" style={{ color: '#666' }}>
          {label}
        </span>
      </div>
      <span
        className="text-[12px] font-medium tabular-nums"
        style={{ color: valueColor, letterSpacing: '-0.012em' }}
      >
        {value}
      </span>
    </div>
  )
}
