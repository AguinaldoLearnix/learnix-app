'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Brain, BookText, HelpCircle, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { markVocabularyViewed } from '@/app/student/actions'

type Tab = 'vocab' | 'text' | 'questions'

export function PreLessonUI({ unit }: { unit: any }) {
  const [activeTab, setActiveTab]     = useState<Tab>('vocab')
  const [vocabDone, setVocabDone]     = useState(false)
  const [textDone, setTextDone]       = useState(false)
  const [questionsDone, setQsDone]    = useState(false)
  const [savingVocab, setSavingVocab] = useState(false)
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const [answers, setAnswers]         = useState<Record<number, string>>({})

  const vocabulary: string[]     = unit.vocabulary ?? []
  const expressions: string[]    = unit.expressions ?? []
  const preText: string          = unit.pre_lesson_text ?? ''
  const questions: string[]      = unit.pre_lesson_questions ?? []

  function flipCard(word: string) {
    setFlippedCards(prev => {
      const next = new Set(prev)
      next.has(word) ? next.delete(word) : next.add(word)
      return next
    })
  }

  async function finishVocab() {
    setSavingVocab(true)
    await markVocabularyViewed(unit.id, vocabulary)
    setSavingVocab(false)
    setVocabDone(true)
    setActiveTab('text')
  }

  const doneCount = [vocabDone, textDone, questionsDone].filter(Boolean).length
  const allDone   = doneCount === 3

  const tabs: { key: Tab; label: string; icon: typeof Brain; done: boolean }[] = [
    { key: 'vocab',     label: 'Vocabulário', icon: Brain,     done: vocabDone },
    { key: 'text',      label: 'Leitura',     icon: BookText,  done: textDone },
    { key: 'questions', label: 'Questões',    icon: HelpCircle,done: questionsDone },
  ]

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 border-b shrink-0"
        style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <Link href="/student" className="flex items-center gap-1.5 text-[12px] hover:opacity-70" style={{ color: '#555' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <span style={{ color: '#333' }}>/</span>
          <span className="text-[13px] font-medium text-white">Pré-aula · Semana {unit.week_number}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px]" style={{ color: '#555' }}>{doneCount}/3 concluídos</span>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full"
                style={{ background: i < doneCount ? '#4ADE80' : 'rgba(255,255,255,0.08)' }} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-6 space-y-5">

        {/* Theme header */}
        <div className="rounded-[20px] p-5 gradient-violet space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Semana {unit.week_number} · Preparação
          </p>
          <p className="text-[20px] font-medium text-white" style={{ letterSpacing: '-0.03em' }}>{unit.theme}</p>
          <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{unit.grammar_focus}</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-[16px]" style={{ background: '#1A1917' }}>
          {tabs.map(({ key, label, icon: Icon, done }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-[13px] font-medium transition-all"
              style={{
                background: activeTab === key ? '#252320' : 'transparent',
                color: activeTab === key ? '#FFF' : '#555',
              }}>
              {done
                ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: '#4ADE80' }} />
                : <Icon className="h-3.5 w-3.5" />}
              {label}
            </button>
          ))}
        </div>

        {/* ── Vocabulary tab ── */}
        {activeTab === 'vocab' && (
          <div className="space-y-4">
            <p className="text-[12px]" style={{ color: '#555' }}>
              Clique nas palavras para ver a tradução/uso. Estude todas antes de continuar.
            </p>

            {/* Vocabulary flip cards */}
            <div className="grid grid-cols-2 gap-3">
              {vocabulary.map(word => {
                const flipped = flippedCards.has(word)
                return (
                  <button key={word} onClick={() => flipCard(word)}
                    className="rounded-[16px] p-4 text-left transition-all"
                    style={{
                      background: flipped ? 'rgba(167,139,250,0.10)' : '#1A1917',
                      border: flipped ? '1px solid rgba(167,139,250,0.25)' : '1px solid transparent',
                      minHeight: 72,
                    }}>
                    <p className="text-[14px] font-medium text-white" style={{ letterSpacing: '-0.015em' }}>{word}</p>
                    {flipped && (
                      <p className="text-[11px] mt-1.5" style={{ color: '#A78BFA' }}>
                        Palavra praticada ✓
                      </p>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Expressions */}
            {expressions.length > 0 && (
              <div className="rounded-[20px] p-5 space-y-3" style={{ background: '#1A1917' }}>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Expressões</p>
                <div className="space-y-2">
                  {expressions.map((exp, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                        style={{ background: 'rgba(96,165,250,0.12)', color: '#60A5FA' }}>
                        {i + 1}
                      </div>
                      <p className="text-[13px]" style={{ color: '#CCC' }}>{exp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={finishVocab} disabled={savingVocab}
              className="w-full py-3 rounded-full text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: '#4ADE80', color: '#000' }}>
              {savingVocab
                ? <><span className="animate-spin">⟳</span> Salvando…</>
                : <><Check className="h-4 w-4" /> Vocabulário concluído — próximo</>}
            </button>
          </div>
        )}

        {/* ── Text tab ── */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            {preText ? (
              <div className="rounded-[20px] p-6 space-y-4" style={{ background: '#1A1917' }}>
                <div className="flex items-center gap-2">
                  <BookText className="h-4 w-4" style={{ color: '#60A5FA' }} />
                  <span className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>
                    Texto de preparação
                  </span>
                </div>
                <div className="prose-sm" style={{ color: '#CCC' }}>
                  {preText.split('\n\n').map((para, i) => (
                    <p key={i} className="text-[14px] leading-relaxed mb-4" style={{ letterSpacing: '-0.01em' }}>{para}</p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[20px] p-8 text-center" style={{ background: '#1A1917' }}>
                <BookText className="h-8 w-8 mx-auto mb-3" style={{ color: '#333' }} />
                <p className="text-[13px] font-medium text-white">Texto não disponível</p>
                <p className="text-[12px] mt-1" style={{ color: '#555' }}>O professor ainda não adicionou um texto de preparação</p>
              </div>
            )}

            {unit.pre_lesson_task && (
              <div className="rounded-[20px] p-5 space-y-2" style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#FACC15' }}>Tarefa pré-aula</p>
                <p className="text-[13px]" style={{ color: '#CCC' }}>{unit.pre_lesson_task}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setActiveTab('vocab')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px]" style={{ color: '#555' }}>
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              <button onClick={() => { setTextDone(true); setActiveTab('questions') }}
                className="flex-1 py-2.5 rounded-full text-[13px] font-medium flex items-center justify-center gap-2"
                style={{ background: '#4ADE80', color: '#000' }}>
                <Check className="h-4 w-4" /> Leitura concluída — próximo
              </button>
            </div>
          </div>
        )}

        {/* ── Questions tab ── */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            {questions.length > 0 ? (
              <div className="space-y-4">
                <p className="text-[12px]" style={{ color: '#555' }}>
                  Responda mentalmente ou por escrito — estas são as perguntas que o professor usará na aula.
                </p>
                {questions.map((q, i) => (
                  <div key={i} className="rounded-[20px] p-5 space-y-3" style={{ background: '#1A1917' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5"
                        style={{ background: 'rgba(167,139,250,0.12)', color: '#A78BFA' }}>
                        {i + 1}
                      </div>
                      <p className="text-[14px] font-medium text-white" style={{ letterSpacing: '-0.015em' }}>{q}</p>
                    </div>
                    <textarea value={answers[i] ?? ''} onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))}
                      placeholder="Sua resposta (opcional)…" rows={2}
                      className="w-full px-3 py-2.5 rounded-xl text-[13px] text-white outline-none resize-none"
                      style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)', letterSpacing: '-0.01em' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[20px] p-8 text-center" style={{ background: '#1A1917' }}>
                <HelpCircle className="h-8 w-8 mx-auto mb-3" style={{ color: '#333' }} />
                <p className="text-[13px] font-medium text-white">Sem questões desta semana</p>
                <p className="text-[12px] mt-1" style={{ color: '#555' }}>O professor não adicionou questões de preparação</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setActiveTab('text')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px]" style={{ color: '#555' }}>
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              <button onClick={() => setQsDone(true)}
                className="flex-1 py-2.5 rounded-full text-[13px] font-medium flex items-center justify-center gap-2"
                style={{ background: '#A78BFA', color: '#FFF' }}>
                <Check className="h-4 w-4" /> Concluir pré-aula
              </button>
            </div>
          </div>
        )}

        {/* All done state */}
        {allDone && (
          <div className="rounded-[20px] p-6 flex flex-col items-center gap-3 text-center"
            style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <CheckCircle2 className="h-8 w-8" style={{ color: '#4ADE80' }} />
            <p className="text-[15px] font-medium text-white">Pré-aula completo!</p>
            <p className="text-[12px]" style={{ color: '#555' }}>Você está pronto para a aula. O vocabulário foi adicionado ao seu banco.</p>
            <Link href="/student" className="mt-2 px-5 py-2 rounded-full text-[13px] font-medium"
              style={{ background: '#4ADE80', color: '#000' }}>
              Voltar ao dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
