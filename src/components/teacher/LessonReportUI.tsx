'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, X, Check, Loader2 } from 'lucide-react'
import { saveLesonReport } from '@/app/teacher/students/[id]/actions'

type ErrorEntry = { category: string; description: string; example: string; correction: string }

const CATEGORIES = ['grammar', 'vocabulary', 'pronunciation', 'fluency', 'writing', 'structure']
const CAT_LABEL: Record<string, string> = {
  grammar: 'Gramática', vocabulary: 'Vocabulário', pronunciation: 'Pronúncia',
  fluency: 'Fluência', writing: 'Escrita', structure: 'Estrutura',
}
const PERF_OPTIONS = [
  { value: 'excellent',  label: '🌟 Excelente',   color: '#4ADE80' },
  { value: 'good',       label: '👍 Bom',          color: '#A78BFA' },
  { value: 'needs_work', label: '⚠️ A trabalhar', color: '#FACC15' },
] as const

export function LessonReportUI({ lesson }: { lesson: any }) {
  const [performance, setPerformance] = useState<'excellent' | 'good' | 'needs_work'>('good')
  const [vocabCovered, setVocabCovered] = useState<string[]>([])
  const [feedbackSummary, setFeedbackSummary] = useState('')
  const [nextLessonNote, setNextLessonNote] = useState('')
  const [taskType, setTaskType] = useState('audio')
  const [taskInstruction, setTaskInstruction] = useState('')
  const [taskDueDays, setTaskDueDays] = useState(5)
  const [errors, setErrors] = useState<ErrorEntry[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const vocabulary: string[] = lesson.unit?.vocabulary ?? []

  function addError() {
    setErrors(prev => [...prev, { category: 'grammar', description: '', example: '', correction: '' }])
  }
  function removeError(i: number) { setErrors(prev => prev.filter((_, idx) => idx !== i)) }
  function updateError(i: number, field: keyof ErrorEntry, value: string) {
    setErrors(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: value } : e))
  }
  function toggleVocab(word: string) {
    setVocabCovered(prev => prev.includes(word) ? prev.filter(w => w !== word) : [...prev, word])
  }

  async function handleSubmit() {
    setSaving(true)
    setSaveError('')
    const result = await saveLesonReport(lesson.id, {
      performance,
      vocabulary_covered: vocabCovered,
      feedback_summary: feedbackSummary,
      next_lesson_note: nextLessonNote,
      errors_logged: errors.filter(e => e.description.trim()),
      task: taskInstruction.trim() ? { type: taskType, instruction: taskInstruction, dueDays: taskDueDays } : null,
    })
    if (result.error) { setSaveError(result.error); setSaving(false) }
    else setSaved(true)
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)' }}>
          <Check className="h-7 w-7" style={{ color: '#4ADE80' }} />
        </div>
        <h2 className="text-[20px] font-medium text-white" style={{ letterSpacing: '-0.03em' }}>Pós-aula salvo!</h2>
        <p className="text-[13px]" style={{ color: '#555' }}>Os erros foram adicionados ao banco e a aula foi concluída.</p>
        <Link href="/teacher" className="mt-4 px-5 py-2.5 rounded-full text-[13px] font-medium"
          style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
          Voltar ao dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 border-b shrink-0"
        style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <Link href="/teacher/pending" className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-70" style={{ color: '#555' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Pendentes
          </Link>
          <span style={{ color: '#333' }}>/</span>
          <span className="text-[13px] font-medium text-white">Pós-aula · {lesson.student?.full_name ?? '—'}</span>
        </div>
        <button onClick={handleSubmit} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ background: '#4ADE80', color: '#0C0B0A' }}>
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Salvar relatório
        </button>
      </div>

      <div className="p-6 max-w-3xl mx-auto w-full space-y-5">

        {/* Lesson info banner */}
        <div className="rounded-[16px] px-5 py-4 flex items-center justify-between" style={{ background: '#1A1917' }}>
          <div>
            <p className="text-[13px] font-medium text-white" style={{ letterSpacing: '-0.013em' }}>
              {lesson.student?.full_name ?? '—'} · Semana {lesson.unit?.week_number ?? '—'}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: '#555' }}>
              {lesson.unit?.theme} · {lesson.unit?.grammar_focus}
            </p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full" style={{ background: '#252320', color: '#555' }}>
            {new Date(lesson.scheduled_at).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* 1. Performance */}
        <section className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>1 · Desempenho geral</p>
          <div className="flex gap-3">
            {PERF_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setPerformance(opt.value)}
                className="flex-1 py-3 rounded-[14px] text-[13px] font-medium transition-all"
                style={{
                  background: performance === opt.value ? `${opt.color}18` : '#1A1917',
                  color: performance === opt.value ? opt.color : '#555',
                  boxShadow: performance === opt.value ? `0 0 0 1px ${opt.color}40` : undefined,
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        {/* 2. Errors */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>2 · Erros identificados</p>
            <button onClick={addError} disabled={errors.length >= 5}
              className="flex items-center gap-1.5 text-[11px] font-medium transition-opacity hover:opacity-70 disabled:opacity-30"
              style={{ color: '#A78BFA' }}>
              <Plus className="h-3 w-3" /> Adicionar ({errors.length}/5)
            </button>
          </div>
          {errors.length === 0 && (
            <div className="rounded-[16px] p-4 text-center text-[12px]"
              style={{ background: '#1A1917', color: '#444', border: '1px dashed rgba(255,255,255,0.08)' }}>
              Nenhum erro registrado ainda
            </div>
          )}
          <div className="space-y-3">
            {errors.map((e, i) => (
              <div key={i} className="rounded-[16px] p-4 space-y-3" style={{ background: '#1A1917' }}>
                <div className="flex items-center justify-between">
                  <select value={e.category} onChange={ev => updateError(i, 'category', ev.target.value)}
                    className="text-[12px] rounded-lg px-2 py-1 border-0 outline-none"
                    style={{ background: '#252320', color: '#FFF' }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
                  </select>
                  <button onClick={() => removeError(i)}><X className="h-3.5 w-3.5" style={{ color: '#555' }} /></button>
                </div>
                <input value={e.description} onChange={ev => updateError(i, 'description', ev.target.value)}
                  placeholder="Descrição do erro (ex: confunde Simple Past e Present Perfect)"
                  className="w-full text-[12px] px-3 py-2 rounded-lg outline-none"
                  style={{ background: '#252320', color: '#FFF', border: '1px solid rgba(255,255,255,0.06)' }} />
                <div className="grid grid-cols-2 gap-2">
                  <input value={e.example} onChange={ev => updateError(i, 'example', ev.target.value)}
                    placeholder="❌ Exemplo incorreto" className="text-[12px] px-3 py-2 rounded-lg outline-none"
                    style={{ background: 'rgba(239,68,68,0.06)', color: '#FFF', border: '1px solid rgba(239,68,68,0.12)' }} />
                  <input value={e.correction} onChange={ev => updateError(i, 'correction', ev.target.value)}
                    placeholder="✓ Forma correta" className="text-[12px] px-3 py-2 rounded-lg outline-none"
                    style={{ background: 'rgba(74,222,128,0.06)', color: '#FFF', border: '1px solid rgba(74,222,128,0.12)' }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Vocabulary covered */}
        {vocabulary.length > 0 && (
          <section className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>3 · Vocabulário trabalhado</p>
            <div className="flex flex-wrap gap-2">
              {vocabulary.map(word => {
                const on = vocabCovered.includes(word)
                return (
                  <button key={word} onClick={() => toggleVocab(word)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                    style={{
                      background: on ? 'rgba(74,222,128,0.12)' : '#1A1917',
                      color: on ? '#4ADE80' : '#555',
                      boxShadow: on ? '0 0 0 1px rgba(74,222,128,0.3)' : undefined,
                    }}>
                    {word}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* 4. Feedback summary */}
        <section className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>4 · Feedback resumido</p>
          <textarea value={feedbackSummary} onChange={e => setFeedbackSummary(e.target.value)}
            placeholder="Resumo da aula para o aluno (máx. 200 palavras)…" rows={4}
            className="w-full text-[13px] px-4 py-3 rounded-[14px] outline-none resize-none leading-relaxed"
            style={{ background: '#1A1917', color: '#FFF', border: '1px solid rgba(255,255,255,0.06)', letterSpacing: '-0.012em' }} />
        </section>

        {/* 5. Task */}
        <section className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>5 · Tarefa pós-aula</p>
          <div className="rounded-[16px] p-4 space-y-3" style={{ background: '#1A1917' }}>
            <div className="flex gap-2">
              {['audio', 'text', 'quiz', 'reading'].map(t => (
                <button key={t} onClick={() => setTaskType(t)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-medium capitalize transition-all"
                  style={{ background: taskType === t ? '#FFFFFF' : '#252320', color: taskType === t ? '#0C0B0A' : '#666' }}>
                  {t === 'audio' ? 'Áudio' : t === 'text' ? 'Texto' : t === 'quiz' ? 'Quiz' : 'Leitura'}
                </button>
              ))}
            </div>
            <input value={taskInstruction} onChange={e => setTaskInstruction(e.target.value)}
              placeholder="Instrução da tarefa…" className="w-full text-[12px] px-3 py-2 rounded-lg outline-none"
              style={{ background: '#252320', color: '#FFF', border: '1px solid rgba(255,255,255,0.06)' }} />
            <div className="flex items-center gap-3">
              <span className="text-[11px]" style={{ color: '#555' }}>Prazo:</span>
              {[3, 5, 7].map(d => (
                <button key={d} onClick={() => setTaskDueDays(d)}
                  className="px-3 py-1 rounded-full text-[11px] font-medium transition-all"
                  style={{ background: taskDueDays === d ? '#FFFFFF' : '#252320', color: taskDueDays === d ? '#0C0B0A' : '#666' }}>
                  {d} dias
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Next lesson note */}
        <section className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>6 · Observação para a próxima aula (opcional)</p>
          <textarea value={nextLessonNote} onChange={e => setNextLessonNote(e.target.value)}
            placeholder="O que você quer lembrar para a próxima aula?…" rows={2}
            className="w-full text-[13px] px-4 py-3 rounded-[14px] outline-none resize-none"
            style={{ background: '#1A1917', color: '#FFF', border: '1px solid rgba(255,255,255,0.06)', letterSpacing: '-0.012em' }} />
        </section>

        {saveError && <p className="text-[12px]" style={{ color: '#F87171' }}>{saveError}</p>}

        <button onClick={handleSubmit} disabled={saving}
          className="w-full py-3.5 rounded-full text-[14px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: '#4ADE80', color: '#0C0B0A' }}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar pós-aula
        </button>
      </div>
    </div>
  )
}
