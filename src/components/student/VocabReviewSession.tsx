'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Brain, Check, X, ChevronRight, RotateCcw } from 'lucide-react'
import { completeVocabReview } from '@/app/student/actions'

interface Review {
  id: string
  word: string
  translation: string
  context_sentence: string
  review_number: number
}

export function VocabReviewSession({ reviews }: { reviews: Review[] }) {
  const [index, setIndex]   = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState<{ id: string; score: number }[]>([])
  const [saving, setSaving]   = useState(false)
  const [done, setDone]       = useState(false)

  const total   = reviews.length
  const current = reviews[index]
  const correct = results.filter(r => r.score === 100).length

  async function answer(score: number) {
    if (saving) return
    setSaving(true)
    await completeVocabReview(current.id, score)
    setSaving(false)

    const next = [...results, { id: current.id, score }]
    setResults(next)

    if (index + 1 >= total) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setFlipped(false)
    }
  }

  if (total === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-8 border-b shrink-0" style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
          <Link href="/student" className="flex items-center gap-1.5 text-[12px] hover:opacity-70" style={{ color: '#555' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.12)' }}>
            <Brain className="h-7 w-7" style={{ color: '#4ADE80' }} />
          </div>
          <p className="text-[18px] font-medium text-white" style={{ letterSpacing: '-0.03em' }}>Sem revisões pendentes</p>
          <p className="text-[13px]" style={{ color: '#555' }}>Você está em dia! Volte amanhã para novas revisões.</p>
          <Link href="/student" className="mt-2 px-5 py-2.5 rounded-full text-[13px] font-medium"
            style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    const pct = Math.round((correct / total) * 100)
    const color = pct >= 80 ? '#4ADE80' : pct >= 60 ? '#FACC15' : '#F87171'
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center px-8 border-b shrink-0" style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
          <Link href="/student" className="flex items-center gap-1.5 text-[12px] hover:opacity-70" style={{ color: '#555' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 gap-6 px-8">
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle cx="48" cy="48" r="40" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - pct / 100)}`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[26px] font-medium text-white" style={{ letterSpacing: '-0.05em' }}>{pct}%</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <p className="text-[20px] font-medium text-white" style={{ letterSpacing: '-0.03em' }}>Revisão concluída!</p>
            <p className="text-[13px]" style={{ color: '#555' }}>{correct} de {total} palavras lembradas</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="rounded-[16px] p-4 text-center" style={{ background: '#1A1917' }}>
              <p className="text-[28px] font-medium text-white" style={{ letterSpacing: '-0.05em' }}>{correct}</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#4ADE80' }}>Sabia</p>
            </div>
            <div className="rounded-[16px] p-4 text-center" style={{ background: '#1A1917' }}>
              <p className="text-[28px] font-medium text-white" style={{ letterSpacing: '-0.05em' }}>{total - correct}</p>
              <p className="text-[11px] mt-0.5" style={{ color: '#F87171' }}>Errei</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/student" className="px-5 py-2.5 rounded-full text-[13px] font-medium"
              style={{ background: '#1A1917', color: '#999' }}>
              Dashboard
            </Link>
            <Link href="/student/practice?mode=vocabulary" className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium"
              style={{ background: '#A78BFA', color: '#FFF' }}>
              <Brain className="h-3.5 w-3.5" /> Praticar mais com IA
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const progressPct = Math.round((index / total) * 100)

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 border-b shrink-0"
        style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <Link href="/student" className="flex items-center gap-1.5 text-[12px] hover:opacity-70" style={{ color: '#555' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <span style={{ color: '#333' }}>/</span>
          <span className="text-[13px] font-medium text-white">Revisão · SRS</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] tabular-nums" style={{ color: '#555' }}>{index + 1} / {total}</span>
          <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%`, background: '#A78BFA' }} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">

        {/* Flashcard */}
        <div
          onClick={() => setFlipped(f => !f)}
          className="w-full max-w-md min-h-[240px] rounded-[28px] p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all select-none"
          style={{
            background: flipped ? '#1A1917' : 'linear-gradient(135deg, #252320 0%, #1A1917 100%)',
            border: flipped ? '1px solid rgba(167,139,250,0.2)' : '1px solid rgba(255,255,255,0.06)',
          }}>
          {!flipped ? (
            <>
              <p className="text-[40px] font-medium text-white text-center" style={{ letterSpacing: '-0.04em' }}>
                {current.word}
              </p>
              <p className="text-[12px]" style={{ color: '#444' }}>Toque para revelar</p>
            </>
          ) : (
            <>
              <p className="text-[13px] font-medium uppercase tracking-[0.08em]" style={{ color: '#A78BFA' }}>
                {current.word}
              </p>
              <p className="text-[28px] font-medium text-white text-center" style={{ letterSpacing: '-0.03em' }}>
                {current.translation || '—'}
              </p>
              {current.context_sentence && (
                <p className="text-[13px] text-center italic" style={{ color: '#666' }}>
                  "{current.context_sentence}"
                </p>
              )}
              <div className="flex items-center gap-1.5 mt-1" style={{ color: '#444' }}>
                <RotateCcw className="h-3 w-3" />
                <span className="text-[11px]">Revisão #{current.review_number}</span>
              </div>
            </>
          )}
        </div>

        {/* Answer buttons */}
        {flipped ? (
          <div className="flex gap-4 w-full max-w-md">
            <button onClick={() => answer(0)} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[18px] text-[14px] font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              <X className="h-5 w-5" /> Errei
            </button>
            <button onClick={() => answer(100)} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[18px] text-[14px] font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
              style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' }}>
              <Check className="h-5 w-5" /> Sabia!
            </button>
          </div>
        ) : (
          <div className="flex gap-3 w-full max-w-md">
            <div className="flex-1 py-4 rounded-[18px] text-[13px] text-center"
              style={{ background: 'rgba(239,68,68,0.06)', color: '#555', border: '1px dashed rgba(255,255,255,0.06)' }}>
              Errei
            </div>
            <div className="flex-1 py-4 rounded-[18px] text-[13px] text-center"
              style={{ background: 'rgba(74,222,128,0.06)', color: '#555', border: '1px dashed rgba(255,255,255,0.06)' }}>
              Sabia!
            </div>
          </div>
        )}

        {/* Skip */}
        <button onClick={() => { setIndex(i => Math.min(i + 1, total - 1)); setFlipped(false) }}
          className="flex items-center gap-1.5 text-[12px] transition-opacity hover:opacity-70"
          style={{ color: '#444' }}>
          Pular <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
