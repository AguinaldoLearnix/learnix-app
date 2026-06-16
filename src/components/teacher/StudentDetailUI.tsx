'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Bot, AlertCircle, CheckCircle2, Clock, FileText, Mic,
  Plus, Calendar, Loader2, X, Sparkles, ChevronDown,
} from 'lucide-react'
import { createProgram, scheduleLesson } from '@/app/teacher/students/[id]/actions'

const SKILL_LABELS = ['Speaking', 'Listening', 'Reading', 'Writing', 'Use of Language']
const SKILL_COLORS = ['#A78BFA', '#60A5FA', '#4ADE80', '#FACC15', '#F87171']
const ERROR_CAT_LABEL: Record<string, string> = {
  grammar: 'Gramática', vocabulary: 'Vocabulário', pronunciation: 'Pronúncia',
  fluency: 'Fluência', writing: 'Escrita', structure: 'Estrutura',
}
const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  active:    { bg: 'rgba(239,68,68,0.12)',  text: '#F87171' },
  improving: { bg: 'rgba(250,204,21,0.12)', text: '#FACC15' },
  resolved:  { bg: 'rgba(74,222,128,0.12)', text: '#4ADE80' },
}
const PERF_LABEL: Record<string, { label: string; color: string }> = {
  excellent:  { label: 'Excelente',   color: '#4ADE80' },
  good:       { label: 'Bom',         color: '#A78BFA' },
  needs_work: { label: 'A trabalhar', color: '#FACC15' },
}
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

interface Props {
  studentUserId: string
  studentUser: any
  profile: any
  program: any
  snapshots: any[]
  errors: any[]
  lessons: any[]
  nextLesson: any
  portfolio: any[]
  aiSessionsWeek: number
}

// ─── Create Program Modal ──────────────────────────────────────────────────

function CreateProgramModal({ studentUserId, profile, onClose }: { studentUserId: string; profile: any; onClose: () => void }) {
  const [form, setForm] = useState({
    language: profile.language === 'english' ? 'English' : 'Spanish',
    start_level: profile.current_level ?? 'B1',
    target_level: profile.target_level ?? 'B2',
    goal: profile.goal ?? 'Professional communication',
    professional_area: profile.professional_area ?? 'general',
    total_weeks: 24,
  })
  const [stage, setStage] = useState<'form' | 'generating' | 'preview' | 'saving'>('form')
  const [units, setUnits] = useState<any[]>([])
  const [error, setError] = useState('')

  async function generate() {
    setStage('generating')
    setError('')
    try {
      const res = await fetch('/api/teacher/generate-program', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setUnits(data.units ?? [])
      setStage('preview')
    } catch (e: any) {
      setError(e.message)
      setStage('form')
    }
  }

  async function save() {
    setStage('saving')
    const result = await createProgram(studentUserId, form, units)
    if (result.error) {
      setError(result.error)
      setStage('preview')
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-2xl rounded-[24px] flex flex-col overflow-hidden" style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.08)', maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: '#A78BFA' }} />
            <span className="text-[14px] font-semibold text-white">Criar programa com IA</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" style={{ color: '#666' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {stage === 'form' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5" style={{ color: '#555' }}>Idioma</label>
                  <input value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-[13px] text-white outline-none"
                    style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)' }} />
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5" style={{ color: '#555' }}>Área profissional</label>
                  <input value={form.professional_area} onChange={e => setForm(f => ({ ...f, professional_area: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-[13px] text-white outline-none"
                    style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)' }} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5" style={{ color: '#555' }}>Nível atual</label>
                  <div className="relative">
                    <select value={form.start_level} onChange={e => setForm(f => ({ ...f, start_level: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-[13px] text-white outline-none appearance-none"
                      style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: '#555' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5" style={{ color: '#555' }}>Nível alvo</label>
                  <div className="relative">
                    <select value={form.target_level} onChange={e => setForm(f => ({ ...f, target_level: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl text-[13px] text-white outline-none appearance-none"
                      style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: '#555' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5" style={{ color: '#555' }}>Total de semanas</label>
                  <div className="relative">
                    <select value={form.total_weeks} onChange={e => setForm(f => ({ ...f, total_weeks: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-xl text-[13px] text-white outline-none appearance-none"
                      style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {[12, 16, 20, 24, 32, 48].map(n => <option key={n} value={n}>{n} semanas</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: '#555' }} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5" style={{ color: '#555' }}>Objetivo do aluno</label>
                <textarea value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 rounded-xl text-[13px] text-white outline-none resize-none"
                  style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)' }} />
              </div>
              {error && <p className="text-[12px]" style={{ color: '#F87171' }}>{error}</p>}
            </div>
          )}

          {stage === 'generating' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#A78BFA' }} />
              <p className="text-[13px] text-white">GPT-4o está criando {form.total_weeks} semanas de conteúdo…</p>
              <p className="text-[11px]" style={{ color: '#555' }}>Isso pode levar 15-30 segundos</p>
            </div>
          )}

          {stage === 'preview' && units.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px]" style={{ color: '#555' }}>{units.length} semanas geradas — revise antes de salvar</p>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {units.map((u: any) => (
                  <div key={u.week_number} className="rounded-xl px-4 py-3" style={{ background: '#252320' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }}>
                        Sem {u.week_number}
                      </span>
                      <span className="text-[13px] font-medium text-white">{u.theme}</span>
                    </div>
                    <p className="text-[11px]" style={{ color: '#666' }}>{u.grammar_focus}</p>
                    <p className="text-[10px] mt-1" style={{ color: '#444' }}>{(u.vocabulary ?? []).slice(0, 5).join(' · ')}</p>
                  </div>
                ))}
              </div>
              {error && <p className="text-[12px]" style={{ color: '#F87171' }}>{error}</p>}
            </div>
          )}

          {stage === 'saving' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#4ADE80' }} />
              <p className="text-[13px] text-white">Salvando programa…</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {stage === 'form' && (
            <>
              <button onClick={onClose} className="px-4 py-2 rounded-full text-[13px]" style={{ color: '#666' }}>Cancelar</button>
              <button onClick={generate} className="flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium text-white"
                style={{ background: '#A78BFA' }}>
                <Sparkles className="h-3.5 w-3.5" /> Gerar com IA
              </button>
            </>
          )}
          {stage === 'preview' && (
            <>
              <button onClick={() => setStage('form')} className="px-4 py-2 rounded-full text-[13px]" style={{ color: '#666' }}>Voltar</button>
              <button onClick={generate} className="px-4 py-2 rounded-full text-[13px]" style={{ color: '#A78BFA' }}>Regenerar</button>
              <button onClick={save} className="flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium text-white"
                style={{ background: '#4ADE80', color: '#000' }}>
                Salvar programa
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Schedule Lesson Modal ─────────────────────────────────────────────────

function ScheduleLessonModal({ studentUserId, units, onClose }: { studentUserId: string; units: any[]; onClose: () => void }) {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(10, 0, 0, 0)

  const [form, setForm] = useState({
    date: tomorrow.toISOString().split('T')[0],
    time: '10:00',
    durationMin: 60,
    unitId: units[0]?.id ?? '',
    meetUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setSaving(true)
    setError('')
    const scheduledAt = new Date(`${form.date}T${form.time}:00`).toISOString()
    const result = await scheduleLesson({
      studentUserId,
      unitId: form.unitId || undefined,
      scheduledAt,
      durationMin: form.durationMin,
      meetUrl: form.meetUrl || undefined,
    })
    if (result.error) { setError(result.error); setSaving(false) }
    else onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-[24px]" style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" style={{ color: '#60A5FA' }} />
            <span className="text-[14px] font-semibold text-white">Agendar aula</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="h-4 w-4" style={{ color: '#666' }} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5" style={{ color: '#555' }}>Data</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-[13px] text-white outline-none"
                style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)', colorScheme: 'dark' }} />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5" style={{ color: '#555' }}>Horário</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl text-[13px] text-white outline-none"
                style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)', colorScheme: 'dark' }} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5" style={{ color: '#555' }}>Duração</label>
            <div className="relative">
              <select value={form.durationMin} onChange={e => setForm(f => ({ ...f, durationMin: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl text-[13px] text-white outline-none appearance-none"
                style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)' }}>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
                <option value={90}>90 minutos</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: '#555' }} />
            </div>
          </div>

          {units.length > 0 && (
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5" style={{ color: '#555' }}>Unidade semanal</label>
              <div className="relative">
                <select value={form.unitId} onChange={e => setForm(f => ({ ...f, unitId: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-[13px] text-white outline-none appearance-none"
                  style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <option value="">Sem unidade específica</option>
                  {units.map((u: any) => (
                    <option key={u.id} value={u.id}>Sem {u.week_number} — {u.theme}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: '#555' }} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.08em] mb-1.5" style={{ color: '#555' }}>Link da reunião (opcional)</label>
            <input value={form.meetUrl} onChange={e => setForm(f => ({ ...f, meetUrl: e.target.value }))}
              placeholder="https://meet.google.com/..."
              className="w-full px-3 py-2 rounded-xl text-[13px] text-white outline-none placeholder:text-[#333]"
              style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)' }} />
          </div>

          {error && <p className="text-[12px]" style={{ color: '#F87171' }}>{error}</p>}
        </div>

        <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-full text-[13px]" style={{ color: '#666' }}>Cancelar</button>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-medium disabled:opacity-50"
            style={{ background: '#60A5FA', color: '#000' }}>
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Calendar className="h-3.5 w-3.5" />}
            Agendar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export function StudentDetailUI({
  studentUserId, studentUser, profile, program, snapshots,
  errors, lessons, nextLesson, portfolio, aiSessionsWeek,
}: Props) {
  const [showCreateProgram, setShowCreateProgram] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)

  const latestSnap = snapshots[0] ?? null
  const prevSnap   = snapshots[1] ?? null
  const scores     = latestSnap ? {
    speaking: latestSnap.speaking, listening: latestSnap.listening,
    reading: latestSnap.reading, writing: latestSnap.writing, uol: latestSnap.uol,
  } : { speaking: 0, listening: 0, reading: 0, writing: 0, uol: 0 }
  const scoreKeys  = ['speaking', 'listening', 'reading', 'writing', 'uol'] as const
  const avgScore   = Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / 5)

  const units: any[] = program?.weekly_units ?? []
  const activeUnit   = units.find((u: any) => u.status === 'active') ?? units[0] ?? null
  const currentWeek  = activeUnit?.week_number ?? 1
  const totalWeeks   = program?.total_weeks ?? 0
  const progressPct  = totalWeeks > 0 ? Math.round((currentWeek / totalWeeks) * 100) : 0

  const initials = (studentUser?.full_name ?? '?').split(' ').map((n: string) => n[0]).slice(0, 2).join('')

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {showCreateProgram && (
        <CreateProgramModal studentUserId={studentUserId} profile={profile} onClose={() => setShowCreateProgram(false)} />
      )}
      {showSchedule && (
        <ScheduleLessonModal studentUserId={studentUserId} units={units} onClose={() => setShowSchedule(false)} />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 border-b shrink-0"
        style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <Link href="/teacher/students" className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-70" style={{ color: '#555' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Alunos
          </Link>
          <span style={{ color: '#333' }}>/</span>
          <span className="text-[13px] font-medium text-white">{studentUser?.full_name ?? '—'}</span>
        </div>
        <div className="flex gap-2">
          {!program && (
            <button onClick={() => setShowCreateProgram(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-opacity hover:opacity-80"
              style={{ background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }}>
              <Sparkles className="h-3.5 w-3.5" /> Criar programa
            </button>
          )}
          <button onClick={() => setShowSchedule(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-opacity hover:opacity-80"
            style={{ background: 'rgba(96,165,250,0.15)', color: '#60A5FA' }}>
            <Calendar className="h-3.5 w-3.5" /> Agendar aula
          </button>
          {nextLesson && (
            <Link href={`/teacher/lessons/${nextLesson.id}/report`}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-opacity hover:opacity-80"
              style={{ background: '#252320', color: '#999' }}>
              <FileText className="h-3.5 w-3.5 inline mr-1.5" /> Pós-aula
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-5 p-6 overflow-hidden">

        {/* ── Left ───────────────────────────────────────────── */}
        <div className="flex-1 space-y-5 overflow-y-auto pr-1">

          {/* Profile card */}
          <div className="rounded-[20px] p-6 gradient-violet space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-[15px] font-semibold"
                  style={{ background: 'rgba(255,255,255,0.15)', color: '#FFF' }}>
                  {initials}
                </div>
                <div>
                  <h2 className="text-white font-medium" style={{ fontSize: 20, letterSpacing: '-0.03em' }}>
                    {studentUser?.full_name ?? '—'}
                  </h2>
                  <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {profile.current_level}→{profile.target_level} · {profile.language} · {profile.professional_area}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[36px] font-medium leading-none text-white" style={{ letterSpacing: '-0.05em' }}>{avgScore}</p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>score médio</p>
              </div>
            </div>

            {program ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  <span>Semana {currentWeek} de {totalWeeks}</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-[4px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.10)' }}>
                  <div className="h-full rounded-full" style={{ width: `${progressPct}%`, background: '#FFF' }} />
                </div>
                {activeUnit && <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>Tema atual: {activeUnit.theme}</p>}
              </div>
            ) : (
              <button onClick={() => setShowCreateProgram(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[14px] text-[13px] font-medium transition-opacity hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.12)', color: '#FFF' }}>
                <Sparkles className="h-4 w-4" /> Criar programa com IA
              </button>
            )}
          </div>

          {/* Skill bars */}
          {latestSnap && (
            <div className="rounded-[20px] p-5 space-y-4" style={{ background: '#1A1917' }}>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Competências</p>
              {scoreKeys.map((k, i) => {
                const curr  = scores[k]
                const prev  = prevSnap?.[k] ?? 0
                const delta = curr - prev
                return (
                  <div key={k} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-white">{SKILL_LABELS[i]}</span>
                      <div className="flex items-center gap-2">
                        {prevSnap && <span className="text-[11px]" style={{ color: delta >= 0 ? '#4ADE80' : '#F87171' }}>{delta >= 0 ? '+' : ''}{delta}</span>}
                        <span className="text-[13px] font-semibold text-white">{curr}</span>
                      </div>
                    </div>
                    <div className="h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${curr}%`, background: SKILL_COLORS[i] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Error bank */}
          {errors.length > 0 && (
            <div className="rounded-[20px] p-5 space-y-3" style={{ background: '#1A1917' }}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Error Bank</p>
                <span className="text-[11px]" style={{ color: '#F87171' }}>
                  {errors.filter((e: any) => e.status === 'active').length} ativos
                </span>
              </div>
              <div className="space-y-2">
                {errors.slice(0, 5).map((e: any) => {
                  const s = STATUS_COLOR[e.status] ?? STATUS_COLOR.active
                  return (
                    <div key={e.id} className="flex items-start gap-3 rounded-xl p-3" style={{ background: '#252320' }}>
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: s.text }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium text-white">{e.description}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: '#555' }}>
                          {ERROR_CAT_LABEL[e.category] ?? e.category} · {e.occurrences}× detectado
                        </p>
                      </div>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0" style={{ background: s.bg, color: s.text }}>
                        {e.status === 'active' ? 'Ativo' : 'Melhorando'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Lesson history */}
          {lessons.length > 0 && (
            <div className="rounded-[20px] p-5 space-y-3" style={{ background: '#1A1917' }}>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Histórico de aulas</p>
              <div className="space-y-2">
                {lessons.map((l: any) => {
                  const perf = PERF_LABEL[l.report?.performance ?? ''] ?? null
                  return (
                    <div key={l.id} className="rounded-xl p-3 space-y-1.5" style={{ background: '#252320' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[12px] font-medium text-white">
                            {l.unit ? `Sem. ${l.unit.week_number} · ${l.unit.theme}` : 'Aula'}
                          </span>
                          <span className="text-[10px] ml-2" style={{ color: '#555' }}>
                            {new Date(l.scheduled_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        {perf && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ color: perf.color, background: `${perf.color}18` }}>
                            {perf.label}
                          </span>
                        )}
                      </div>
                      {l.report?.feedback_summary && (
                        <p className="text-[11px] italic" style={{ color: '#666' }}>📌 {l.report.feedback_summary}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty state: no lessons and no program */}
          {lessons.length === 0 && !program && (
            <div className="rounded-[20px] p-8 flex flex-col items-center gap-3 text-center" style={{ background: '#1A1917' }}>
              <Bot className="h-8 w-8" style={{ color: '#333' }} />
              <p className="text-[13px] font-medium text-white">Nenhuma atividade ainda</p>
              <p className="text-[12px]" style={{ color: '#555' }}>Crie um programa e agende a primeira aula</p>
            </div>
          )}
        </div>

        {/* ── Right sidebar ──────────────────────────────────── */}
        <div className="w-[240px] shrink-0 space-y-4">

          {/* Engagement */}
          <div className="rounded-[20px] p-5 space-y-3" style={{ background: '#1A1917' }}>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Atividade</p>
            <div className="space-y-2">
              {[
                { label: 'Sessões IA (semana)', value: aiSessionsWeek },
                { label: 'Erros ativos',        value: errors.filter((e: any) => e.status === 'active').length },
                { label: 'Portfólio',           value: portfolio.length },
                { label: 'Aulas concluídas',    value: lessons.length },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: '#555' }}>{label}</span>
                  <span className="text-[12px] font-semibold text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Next lesson */}
          {nextLesson ? (
            <div className="rounded-[20px] p-4 space-y-2" style={{ background: '#1A1917' }}>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Próxima aula</p>
              <p className="text-[13px] font-medium text-white">
                {new Date(nextLesson.scheduled_at).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
              </p>
              <p className="text-[12px]" style={{ color: '#666' }}>
                {new Date(nextLesson.scheduled_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                {nextLesson.unit && ` · Sem. ${nextLesson.unit.week_number}`}
              </p>
              {nextLesson.meet_url && (
                <a href={nextLesson.meet_url} target="_blank" rel="noreferrer"
                  className="block text-center py-1.5 rounded-full text-[11px] font-medium mt-2 transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80' }}>
                  Entrar na reunião
                </a>
              )}
            </div>
          ) : (
            <div className="rounded-[20px] p-4 space-y-2" style={{ background: '#1A1917' }}>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Próxima aula</p>
              <p className="text-[12px]" style={{ color: '#444' }}>Nenhuma aula agendada</p>
              <button onClick={() => setShowSchedule(true)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-medium mt-1 transition-opacity hover:opacity-80"
                style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA' }}>
                <Plus className="h-3 w-3" /> Agendar
              </button>
            </div>
          )}

          {/* Portfolio */}
          {portfolio.length > 0 && (
            <div className="rounded-[20px] p-4 space-y-3" style={{ background: '#1A1917' }}>
              <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Portfólio recente</p>
              {portfolio.map((p: any) => (
                <div key={p.id} className="flex items-center gap-2.5">
                  {p.type === 'audio'
                    ? <Mic className="h-3.5 w-3.5 shrink-0" style={{ color: '#4ADE80' }} />
                    : <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: '#60A5FA' }} />}
                  <span className="text-[12px] flex-1 text-white truncate">{p.title}</span>
                  {p.score != null && (
                    <span className="text-[11px] font-semibold" style={{ color: p.score >= 80 ? '#4ADE80' : '#FACC15' }}>
                      {p.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Student info */}
          <div className="rounded-[20px] p-4 space-y-2" style={{ background: '#1A1917' }}>
            <p className="text-[10px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Informações</p>
            {[
              { label: 'Email', value: studentUser?.email },
              { label: 'Objetivo', value: profile.goal },
              { label: 'Plano', value: profile.plan_type },
            ].map(({ label, value }) => value ? (
              <div key={label}>
                <p className="text-[10px]" style={{ color: '#444' }}>{label}</p>
                <p className="text-[12px] text-white truncate">{value}</p>
              </div>
            ) : null)}
          </div>
        </div>
      </div>
    </div>
  )
}
