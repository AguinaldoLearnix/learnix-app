'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Bot, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/student', label: 'Esta semana', icon: BookOpen },
  { href: '/student/practice', label: 'Praticar IA', icon: Bot },
  { href: '/student/progress', label: 'Progresso', icon: TrendingUp },
]

export function StudentNav() {
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: 'rgba(12,11,10,0.85)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.08)',
        height: 56,
      }}
    >
      <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-4">
        {/* Wordmark */}
        <span
          className="text-white font-medium tracking-tight select-none"
          style={{ fontSize: 15, letterSpacing: '-0.02em' }}
        >
          Learnix
        </span>

        {/* Nav pills */}
        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-[7px] transition-colors',
                  'text-[13px] font-medium tracking-[-0.013em]',
                  active
                    ? 'text-white rounded-full'
                    : 'text-[#999] hover:text-white rounded-full'
                )}
                style={active ? { background: '#1A1917' } : {}}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* CTA pill */}
        <button
          className="hidden sm:flex items-center px-4 py-[9px] rounded-full text-[13px] font-medium tracking-[-0.014em] transition-opacity hover:opacity-80 active:scale-[0.97]"
          style={{ background: '#FFFFFF', color: '#0C0B0A' }}
        >
          Agendar aula
        </button>
      </div>
    </header>
  )
}
