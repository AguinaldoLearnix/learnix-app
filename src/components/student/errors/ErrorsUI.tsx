'use client'

import { useState } from 'react'
import { AlertCircle, Bot, User, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import type { ErrorBankEntry } from '@/types'

const CATEGORIES = ['all', 'grammar', 'vocabulary', 'pronunciation', 'fluency', 'writing', 'structure'] as const
const STATUSES   = ['all', 'active', 'improving', 'resolved'] as const

const categoryLabel: Record<string, string> = {
  grammar: 'Gramática', vocabulary: 'Vocabulário', pronunciation: 'Pronúncia',
  fluency: 'Fluência', writing: 'Escrita', structure: 'Estrutura',
}
const statusColor: Record<string, { bg: string; text: string }> = {
  active:    { bg: 'rgba(239,68,68,0.12)',   text: '#F87171' },
  improving: { bg: 'rgba(250,204,21,0.12)',  text: '#FACC15' },
  resolved:  { bg: 'rgba(74,222,128,0.12)', text: '#4ADE80' },
}
const statusLabel: Record<string, string> = {
  active: 'Ativo', improving: 'Melhorando', resolved: 'Resolvido',
}

function ErrorCard({ error }: { error: ErrorBankEntry }) {
  const [open, setOpen] = useState(false)
  const { bg, text } = statusColor[error.status]

  return (
    <div className="rounded-[16px] overflow-hidden transition-all" style={{ background: '#1A1917' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3.5 p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: bg }}>
          <AlertCircle className="h-3.5 w-3.5" style={{ color: text }} />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#888' }}>
              {categoryLabel[error.category]}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: bg, color: text }}>
              {statusLabel[error.status]}
            </span>
            <span className="flex items-center gap-1 text-[10px]" style={{ color: '#555' }}>
              {error.source === 'ai' ? <><Bot className="h-3 w-3" /> IA</> : <><User className="h-3 w-3" /> Professor</>}
            </span>
          </div>
          <p className="text-[13px] font-medium text-white leading-snug" style={{ letterSpacing: '-0.013em' }}>
            {error.description}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-center">
            <p className="text-[18px] font-semibold tabular-nums text-white" style={{ letterSpacing: '-0.03em' }}>
              {error.occurrences}×
            </p>
            <p className="text-[9px]" style={{ color: '#555' }}>ocorrências</p>
          </div>
          {open ? <ChevronUp className="h-4 w-4" style={{ color: '#555' }} /> : <ChevronDown className="h-4 w-4" style={{ color: '#555' }} />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-4 space-y-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="grid grid-cols-2 gap-3 pt-3">
            <div className="rounded-xl p-3 space-y-1" style={{ background: 'rgba(239,68,68,0.06)' }}>
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#F87171' }}>❌ Erro</p>
              <p className="text-[12px] italic" style={{ color: '#CCC' }}>{error.example || '—'}</p>
            </div>
            <div className="rounded-xl p-3 space-y-1" style={{ background: 'rgba(74,222,128,0.06)' }}>
              <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#4ADE80' }}>✓ Correto</p>
              <p className="text-[12px] italic" style={{ color: '#CCC' }}>{error.correction || '—'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-medium transition-opacity hover:opacity-80"
              style={{ background: 'rgba(167,139,250,0.12)', color: '#A78BFA' }}
            >
              <RotateCcw className="h-3 w-3" />
              Praticar este erro
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function ErrorsUI({ errors }: { errors: ErrorBankEntry[] }) {
  const [category, setCategory] = useState<typeof CATEGORIES[number]>('all')
  const [status, setStatus] = useState<typeof STATUSES[number]>('all')

  const filtered = errors.filter(e =>
    (category === 'all' || e.category === category) &&
    (status   === 'all' || e.status   === status)
  )

  const counts = {
    active:    errors.filter(e => e.status === 'active').length,
    improving: errors.filter(e => e.status === 'improving').length,
    resolved:  errors.filter(e => e.status === 'resolved').length,
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between px-8 border-b shrink-0" style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
        <h1 className="text-white font-medium" style={{ fontSize: 15, letterSpacing: '-0.015em' }}>Error Bank</h1>
        <div className="flex gap-3 text-[12px]">
          <span style={{ color: '#F87171' }}>{counts.active} ativos</span>
          <span style={{ color: '#FACC15' }}>{counts.improving} melhorando</span>
          <span style={{ color: '#4ADE80' }}>{counts.resolved} resolvidos</span>
        </div>
      </div>

      <div className="flex flex-1 gap-5 p-6 overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => {
              const active = status === s
              const cfg = s === 'all' ? null : statusColor[s]
              return (
                <button key={s} onClick={() => setStatus(s)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                  style={{
                    background: active ? (cfg?.bg ?? '#1A1917') : 'rgba(255,255,255,0.04)',
                    color: active ? (cfg?.text ?? '#FFF') : '#555',
                    boxShadow: active && cfg ? `0 0 0 1px ${cfg.text}40` : undefined,
                  }}>
                  {s === 'all' ? 'Todos' : statusLabel[s]}
                  {s !== 'all' && ` · ${counts[s as keyof typeof counts]}`}
                </button>
              )
            })}
          </div>

          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-16" style={{ color: '#555' }}>
                <AlertCircle className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-[13px]">Nenhum erro nesta categoria</p>
              </div>
            ) : filtered.map(e => <ErrorCard key={e.id} error={e} />)}
          </div>
        </div>

        <div className="w-[220px] shrink-0 space-y-4">
          <div className="rounded-[20px] p-4 space-y-2" style={{ background: '#1A1917' }}>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em] mb-3" style={{ color: '#555' }}>Categoria</p>
            {CATEGORIES.map(c => {
              const count = c === 'all' ? errors.length : errors.filter(e => e.category === c).length
              const active = category === c
              return (
                <button key={c} onClick={() => setCategory(c)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-[12px] transition-colors"
                  style={{ background: active ? '#252320' : 'transparent', color: active ? '#FFF' : '#666' }}>
                  <span>{c === 'all' ? 'Todos' : categoryLabel[c]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#555' }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="rounded-[20px] p-4 space-y-2" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
            <p className="text-[11px] font-semibold" style={{ color: '#A78BFA' }}>Dica da IA</p>
            <p className="text-[11px] leading-relaxed" style={{ color: '#888' }}>
              {errors.length > 0
                ? `Seu erro mais frequente é em ${categoryLabel[errors[0].category] ?? 'gramática'}. Pratique com o AI Companion no modo "Erros".`
                : 'Nenhum erro registrado ainda. Continue praticando!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
