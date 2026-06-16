'use client'

import { Brain, PenLine, Mic, Users, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PracticeMode = 'vocabulary' | 'writing' | 'speaking' | 'simulation' | 'error_review'

const modes = [
  { id: 'vocabulary' as const, label: 'Vocabulário', icon: Brain,      color: '#A78BFA' },
  { id: 'writing'    as const, label: 'Escrita',     icon: PenLine,    color: '#60A5FA' },
  { id: 'speaking'   as const, label: 'Speaking',    icon: Mic,        color: '#4ADE80' },
  { id: 'simulation' as const, label: 'Simulação',   icon: Users,      color: '#FACC15' },
  { id: 'error_review' as const, label: 'Erros',     icon: AlertCircle, color: '#F87171' },
]

interface Props {
  active: PracticeMode
  onChange: (m: PracticeMode) => void
  sessionCounts: Record<PracticeMode, number>
  dailyLimit: number
}

export function ModeSelector({ active, onChange, sessionCounts, dailyLimit }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {modes.map(({ id, label, icon: Icon, color }) => {
        const isActive = active === id
        const count = sessionCounts[id]
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              'flex flex-col items-center gap-2 py-3 px-2 rounded-[16px] transition-all',
              'text-center border',
              isActive ? 'border-transparent' : 'border-transparent hover:border-white/10'
            )}
            style={{
              background: isActive ? `${color}18` : '#1A1917',
              boxShadow: isActive ? `0 0 0 1px ${color}40` : undefined,
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: isActive ? `${color}22` : 'rgba(255,255,255,0.05)' }}
            >
              <Icon className="h-4 w-4" style={{ color: isActive ? color : '#666' }} />
            </div>
            <span
              className="text-[11px] font-medium leading-tight"
              style={{ color: isActive ? '#FFF' : '#666', letterSpacing: '-0.01em' }}
            >
              {label}
            </span>
            {count > 0 && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#555' }}
              >
                {count} hoje
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
