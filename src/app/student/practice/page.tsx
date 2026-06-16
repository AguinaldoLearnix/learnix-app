'use client'

import { useState } from 'react'
import { Brain, Zap, BookOpen, ChevronRight } from 'lucide-react'
import { ModeSelector, type PracticeMode } from '@/components/student/practice/ModeSelector'
import { ChatWindow } from '@/components/student/practice/ChatWindow'

const DAILY_LIMIT = 5

const modeColors: Record<PracticeMode, string> = {
  vocabulary:   '#A78BFA',
  writing:      '#60A5FA',
  speaking:     '#4ADE80',
  simulation:   '#FACC15',
  error_review: '#F87171',
}

// Context is loaded server-side and passed via query params or props.
// For now we read from a shared module that can be hydrated server-side.
export default function PracticePage() {
  const [mode, setMode] = useState<PracticeMode>('vocabulary')
  const sessionsToday = 0
  const sessionsLeft  = DAILY_LIMIT - sessionsToday
  const accent        = modeColors[mode]

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 border-b shrink-0"
        style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
        <h1 className="text-white font-medium" style={{ fontSize: 15, letterSpacing: '-0.015em' }}>
          Praticar com IA
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-[12px]" style={{ color: '#555' }}>{sessionsToday} sessões hoje</span>
          <div className="flex gap-1">
            {Array.from({ length: DAILY_LIMIT }).map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full"
                style={{ background: i < sessionsToday ? accent : 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
          <span className="text-[12px]" style={{ color: '#555' }}>{sessionsLeft} restante{sessionsLeft !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 pt-5 pb-3 shrink-0">
            <ModeSelector active={mode} onChange={setMode}
              sessionCounts={{ vocabulary: 0, writing: 0, speaking: 0, simulation: 0, error_review: 0 }}
              dailyLimit={DAILY_LIMIT} />
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatWindow mode={mode} />
          </div>
        </div>

        {/* Right panel */}
        <div className="w-[260px] shrink-0 border-l flex flex-col overflow-y-auto"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}>

          <div className="p-4 border-b space-y-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Sessão atual</p>
            <div className="grid grid-cols-3 gap-2">
              {[{ label: 'Palavras', value: '0' }, { label: 'Erros', value: '0' }, { label: 'Acertos', value: '0' }].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-2.5 text-center" style={{ background: '#1A1917' }}>
                  <p className="text-white font-semibold text-[18px] tabular-nums" style={{ letterSpacing: '-0.03em' }}>{value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#555' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-3.5 w-3.5" style={{ color: '#555' }} />
              <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Como funciona</p>
            </div>
            <div className="space-y-2">
              {[
                { mode: 'vocabulary' as PracticeMode, label: 'Vocabulário', desc: 'Pratica as palavras da semana', color: '#A78BFA' },
                { mode: 'writing' as PracticeMode, label: 'Escrita', desc: 'Correção em 3 camadas', color: '#60A5FA' },
                { mode: 'speaking' as PracticeMode, label: 'Speaking', desc: 'Grave e receba feedback', color: '#4ADE80' },
                { mode: 'simulation' as PracticeMode, label: 'Simulação', desc: 'Cenários do mundo real', color: '#FACC15' },
                { mode: 'error_review' as PracticeMode, label: 'Erros', desc: 'Treina seus erros recorrentes', color: '#F87171' },
              ].map(item => (
                <button key={item.mode} onClick={() => setMode(item.mode)}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/5"
                  style={{ background: mode === item.mode ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
                  <div>
                    <p className="text-[12px] font-medium text-white">{item.label}</p>
                    <p className="text-[10px]" style={{ color: '#555' }}>{item.desc}</p>
                  </div>
                  {mode === item.mode && <ChevronRight className="h-3 w-3 ml-auto" style={{ color: '#444' }} />}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 mt-auto border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="rounded-[16px] p-3 space-y-1.5" style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3" style={{ color: '#A78BFA' }} />
                <p className="text-[11px] font-semibold" style={{ color: '#A78BFA' }}>Powered by GPT-4o</p>
              </div>
              <p className="text-[10px] leading-relaxed" style={{ color: '#666' }}>
                Voz gerada com TTS-HD · Transcrição via Whisper · Respostas contextuais da semana
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
