'use client'

import { useState, useCallback } from 'react'
import { GraduationCap, ChevronRight, ChevronLeft, Loader2, Check, Mic, Brain, BookOpen, Target, Clock, Globe } from 'lucide-react'
import { completeStudentOnboarding } from './actions'

type Step = 'welcome' | 'profile' | 'goals' | 'schedule' | 'assessment' | 'generating' | 'preview'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const ASSESSMENT_QUESTIONS = [
  {
    label: 'Apresentação',
    prompt: 'Introduce yourself in English. Tell me your name, what you do, and a bit about your daily work.',
  },
  {
    label: 'Situação profissional',
    prompt: 'Describe a challenging situation you faced at work recently. What happened, what did you do, and what was the result?',
  },
  {
    label: 'Opinião profissional',
    prompt: 'In your opinion, what are the most important skills that professionals in your field will need in the next 5 years? Please explain why.',
  },
]

const GOAL_OPTIONS = [
  { value: 'professional', label: 'Crescimento profissional', desc: 'Reuniões, apresentações, negociações' },
  { value: 'travel', label: 'Viagens internacionais', desc: 'Comunicação em viagens e turismo' },
  { value: 'academic', label: 'Acadêmico / Intercâmbio', desc: 'Estudos, artigos, apresentações' },
  { value: 'conversational', label: 'Conversação geral', desc: 'Confiança no dia a dia' },
]

interface ProgramUnit {
  week_number: number
  theme: string
  grammar_focus: string
  vocabulary: string[]
  can_do_statements: string[]
  pre_lesson_text: string
  pre_lesson_questions: string[]
}

interface Program {
  title: string
  description: string
  total_weeks: number
  units: ProgramUnit[]
}

export default function StudentOnboarding() {
  const [step, setStep] = useState<Step>('welcome')
  const [saving, setSaving] = useState(false)

  // Form data
  const [fullName, setFullName] = useState('')
  const [professionalArea, setProfessionalArea] = useState('')
  const [language, setLanguage] = useState('english')
  const [goal, setGoal] = useState('')
  const [targetLevel, setTargetLevel] = useState('B2')
  const [deadlineMonths, setDeadlineMonths] = useState(6)
  const [weeklyFrequency, setWeeklyFrequency] = useState(3)
  const [studyTimeDaily, setStudyTimeDaily] = useState(30)
  const [interests, setInterests] = useState('')

  // Assessment
  const [answers, setAnswers] = useState(['', '', ''])
  const [currentQ, setCurrentQ] = useState(0)
  const [assessing, setAssessing] = useState(false)
  const [assessedLevel, setAssessedLevel] = useState('')
  const [assessExplanation, setAssessExplanation] = useState('')

  // Program
  const [program, setProgram] = useState<Program | null>(null)

  function nextStep(to: Step) { setStep(to) }

  async function runAssessment() {
    if (answers.some(a => a.trim().length < 20)) {
      alert('Por favor responda todas as perguntas com pelo menos uma frase completa.')
      return
    }
    setStep('generating')
    setAssessing(true)
    try {
      const res = await fetch('/api/onboarding/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, professional_area: professionalArea }),
      })
      const result = await res.json()
      setAssessedLevel(result.level ?? 'B1')
      setAssessExplanation(result.explanation ?? '')

      // Generate program
      const res2 = await fetch('/api/onboarding/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: result.level ?? 'B1',
          target_level: targetLevel,
          goal,
          professional_area: professionalArea,
          interests,
          weekly_frequency: weeklyFrequency,
          deadline_months: deadlineMonths,
        }),
      })
      const prog = await res2.json()
      setProgram(prog)
      setStep('preview')
    } catch (err: any) {
      alert('Erro ao gerar avaliação: ' + err.message)
      setStep('assessment')
    } finally {
      setAssessing(false)
    }
  }

  async function handleConfirm() {
    if (!program) return
    setSaving(true)
    try {
      await completeStudentOnboarding({
        professional_area: professionalArea,
        language,
        goal,
        target_level: targetLevel,
        deadline_months: deadlineMonths,
        weekly_frequency: weeklyFrequency,
        study_time_daily: studyTimeDaily,
        interests,
        assessed_level: assessedLevel,
        program,
      })
    } catch {
      setSaving(false)
    }
  }

  const completionDate = new Date()
  completionDate.setMonth(completionDate.getMonth() + deadlineMonths)
  const completionStr = completionDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0C0B0A' }}
    >
      {/* Logo */}
      <div className="fixed top-6 left-6 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#FFFFFF' }}>
          <GraduationCap className="h-4 w-4" style={{ color: '#0C0B0A' }} />
        </div>
        <span className="font-medium text-white" style={{ fontSize: 15, letterSpacing: '-0.02em' }}>Learnix</span>
      </div>

      <div className="w-full max-w-lg">

        {/* ── WELCOME ── */}
        {step === 'welcome' && (
          <div className="space-y-8 text-center">
            <div className="space-y-3">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
                style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1
                className="text-white font-medium"
                style={{ fontSize: 32, letterSpacing: '-0.05em', lineHeight: 1.05 }}
              >
                Bem-vindo à Learnix
              </h1>
              <p className="text-[15px]" style={{ color: '#666', letterSpacing: '-0.013em' }}>
                Em alguns minutos vamos entender seu nível atual, seus objetivos e criar um programa personalizado com IA.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: Brain, label: 'Avaliação de nível por IA', desc: '3 perguntas em inglês · ~5 min' },
                { icon: Target, label: 'Programa personalizado', desc: 'Semanas temáticas baseadas no seu perfil' },
                { icon: Clock, label: 'Prazo estimado', desc: 'Cronograma realista para atingir seu objetivo' },
              ].map(({ icon: Icon, label, desc }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 p-4 rounded-[18px] text-left"
                  style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#252320' }}>
                    <Icon className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-white" style={{ letterSpacing: '-0.013em' }}>{label}</p>
                    <p className="text-[12px]" style={{ color: '#555' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => nextStep('profile')}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-[14px] font-medium transition-opacity hover:opacity-90"
              style={{ background: '#FFFFFF', color: '#0C0B0A' }}
            >
              Começar avaliação <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── PROFILE ── */}
        {step === 'profile' && (
          <div className="space-y-6">
            <StepHeader step={1} total={4} title="Seu perfil" subtitle="Nos conte um pouco sobre você." />

            <div className="space-y-4">
              <Field label="Área profissional" required>
                <input
                  value={professionalArea}
                  onChange={e => setProfessionalArea(e.target.value)}
                  placeholder="Ex: Marketing digital, Engenharia de software, Finanças..."
                  className="input-field"
                />
              </Field>

              <Field label="Interesses e hobbies">
                <input
                  value={interests}
                  onChange={e => setInterests(e.target.value)}
                  placeholder="Ex: tecnologia, filmes, esportes, viagens..."
                  className="input-field"
                />
              </Field>

              <Field label="Idioma">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'english', label: '🇺🇸 Inglês' },
                    { value: 'spanish', label: '🇪🇸 Espanhol' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setLanguage(opt.value)}
                      className="py-3 rounded-[14px] text-[13px] font-medium transition-all"
                      style={{
                        background: language === opt.value ? '#FFFFFF' : '#1A1917',
                        color: language === opt.value ? '#0C0B0A' : '#666',
                        border: `1px solid ${language === opt.value ? 'transparent' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <NavButtons
              onBack={() => nextStep('welcome')}
              onNext={() => nextStep('goals')}
              nextDisabled={!professionalArea.trim()}
            />
          </div>
        )}

        {/* ── GOALS ── */}
        {step === 'goals' && (
          <div className="space-y-6">
            <StepHeader step={2} total={4} title="Objetivos" subtitle="O que você quer alcançar?" />

            <div className="space-y-4">
              <Field label="Objetivo principal" required>
                <div className="space-y-2">
                  {GOAL_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setGoal(opt.value)}
                      className="flex items-center gap-3 w-full p-4 rounded-[14px] text-left transition-all"
                      style={{
                        background: goal === opt.value ? 'rgba(255,255,255,0.06)' : '#1A1917',
                        border: `1px solid ${goal === opt.value ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)'}`,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                        style={{ borderColor: goal === opt.value ? '#FFFFFF' : '#444' }}
                      >
                        {goal === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-white">{opt.label}</p>
                        <p className="text-[12px]" style={{ color: '#555' }}>{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Nível alvo" required>
                <div className="grid grid-cols-6 gap-2">
                  {CEFR_LEVELS.map(lv => (
                    <button
                      key={lv}
                      onClick={() => setTargetLevel(lv)}
                      className="py-2.5 rounded-xl text-[13px] font-medium transition-all"
                      style={{
                        background: targetLevel === lv ? '#FFFFFF' : '#1A1917',
                        color: targetLevel === lv ? '#0C0B0A' : '#555',
                      }}
                    >
                      {lv}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Prazo para atingir o objetivo">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={2}
                    max={24}
                    value={deadlineMonths}
                    onChange={e => setDeadlineMonths(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-[13px] font-medium text-white w-24 text-right">
                    {deadlineMonths} {deadlineMonths === 1 ? 'mês' : 'meses'}
                  </span>
                </div>
                <p className="text-[12px] mt-1" style={{ color: '#555' }}>
                  Meta: {completionStr}
                </p>
              </Field>
            </div>

            <NavButtons
              onBack={() => nextStep('profile')}
              onNext={() => nextStep('schedule')}
              nextDisabled={!goal}
            />
          </div>
        )}

        {/* ── SCHEDULE ── */}
        {step === 'schedule' && (
          <div className="space-y-6">
            <StepHeader step={3} total={4} title="Dedicação" subtitle="Quanto tempo você tem disponível?" />

            <div className="space-y-4">
              <Field label="Sessões por semana">
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setWeeklyFrequency(n)}
                      className="py-3 rounded-[14px] text-[13px] font-medium transition-all"
                      style={{
                        background: weeklyFrequency === n ? '#FFFFFF' : '#1A1917',
                        color: weeklyFrequency === n ? '#0C0B0A' : '#555',
                      }}
                    >
                      {n}x
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Minutos de estudo por dia">
                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map(n => (
                    <button
                      key={n}
                      onClick={() => setStudyTimeDaily(n)}
                      className="py-3 rounded-[14px] text-[13px] font-medium transition-all"
                      style={{
                        background: studyTimeDaily === n ? '#FFFFFF' : '#1A1917',
                        color: studyTimeDaily === n ? '#0C0B0A' : '#555',
                      }}
                    >
                      {n} min
                    </button>
                  ))}
                </div>
              </Field>

              <div
                className="rounded-[16px] p-4 space-y-1"
                style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <p className="text-[12px] font-medium text-white">Resumo da dedicação</p>
                <p className="text-[12px]" style={{ color: '#555' }}>
                  {weeklyFrequency}x por semana · {studyTimeDaily} min/dia · ~{Math.round(weeklyFrequency * studyTimeDaily / 60 * 10) / 10}h por semana
                </p>
              </div>
            </div>

            <NavButtons
              onBack={() => nextStep('goals')}
              onNext={() => nextStep('assessment')}
            />
          </div>
        )}

        {/* ── ASSESSMENT ── */}
        {step === 'assessment' && (
          <div className="space-y-6">
            <StepHeader
              step={4}
              total={4}
              title="Avaliação de nível"
              subtitle={`Responda em inglês — ${ASSESSMENT_QUESTIONS[currentQ].label}`}
            />

            {/* Progress dots */}
            <div className="flex gap-2">
              {ASSESSMENT_QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className="h-1 flex-1 rounded-full transition-all"
                  style={{ background: i <= currentQ ? '#FFFFFF' : 'rgba(255,255,255,0.12)' }}
                />
              ))}
            </div>

            <div
              className="rounded-[18px] p-5 space-y-4"
              style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p
                className="text-[14px] font-medium text-white leading-snug"
                style={{ letterSpacing: '-0.013em' }}
              >
                {ASSESSMENT_QUESTIONS[currentQ].prompt}
              </p>
              <textarea
                value={answers[currentQ]}
                onChange={e => {
                  const next = [...answers]
                  next[currentQ] = e.target.value
                  setAnswers(next)
                }}
                placeholder="Type your answer in English..."
                rows={5}
                className="w-full resize-none bg-transparent text-[13px] text-white placeholder-[#444] outline-none"
                style={{ letterSpacing: '-0.012em', lineHeight: 1.6 }}
              />
            </div>

            <div className="flex gap-3">
              {currentQ > 0 && (
                <button
                  onClick={() => setCurrentQ(q => q - 1)}
                  className="flex items-center gap-1.5 px-5 py-3 rounded-full text-[13px] font-medium"
                  style={{ background: '#1A1917', color: '#666' }}
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
              )}

              {currentQ < ASSESSMENT_QUESTIONS.length - 1 ? (
                <button
                  onClick={() => setCurrentQ(q => q + 1)}
                  disabled={!answers[currentQ].trim()}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ background: '#FFFFFF', color: '#0C0B0A' }}
                >
                  Próxima pergunta <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={runAssessment}
                  disabled={answers.some(a => !a.trim())}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ background: '#FFFFFF', color: '#0C0B0A' }}
                >
                  Avaliar e gerar programa <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── GENERATING ── */}
        {step === 'generating' && (
          <div className="text-center space-y-6 py-12">
            <div className="flex flex-col items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#1A1917' }}
              >
                <Loader2 className="h-7 w-7 text-white animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-[18px] font-medium text-white" style={{ letterSpacing: '-0.03em' }}>
                  Analisando suas respostas...
                </p>
                <p className="text-[13px]" style={{ color: '#555' }}>
                  A IA está avaliando seu nível e gerando seu programa personalizado
                </p>
              </div>
            </div>
            <div className="flex justify-center gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: '#555',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── PREVIEW ── */}
        {step === 'preview' && program && (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-medium mb-2"
                style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80' }}
              >
                <Check className="h-3.5 w-3.5" /> Avaliação concluída
              </div>
              <h2 className="text-white font-medium" style={{ fontSize: 22, letterSpacing: '-0.04em' }}>
                Seu nível: <span style={{ color: '#A78BFA' }}>{assessedLevel}</span> → meta {targetLevel}
              </h2>
              {assessExplanation && (
                <p className="text-[13px]" style={{ color: '#666' }}>{assessExplanation}</p>
              )}
            </div>

            {/* Program card */}
            <div
              className="rounded-[20px] p-5 space-y-4"
              style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: '#555' }}>
                  Programa gerado pela IA
                </p>
                <p className="text-[16px] font-medium text-white" style={{ letterSpacing: '-0.02em' }}>
                  {program.title}
                </p>
                <p className="text-[13px] mt-1" style={{ color: '#666' }}>{program.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Semanas', value: program.total_weeks },
                  { label: 'Sessões/sem', value: weeklyFrequency + 'x' },
                  { label: 'Conclusão', value: completionStr.split(' ')[0] },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-3 text-center" style={{ background: '#252320' }}>
                    <p className="text-[18px] font-medium text-white" style={{ letterSpacing: '-0.04em' }}>{value}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#555' }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* First 4 weeks preview */}
              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>
                  Primeiras semanas
                </p>
                {program.units.slice(0, 4).map(u => (
                  <div key={u.week_number} className="flex items-center gap-3">
                    <span
                      className="text-[11px] font-medium w-8 shrink-0"
                      style={{ color: '#444' }}
                    >
                      W{u.week_number}
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    <span className="text-[12px]" style={{ color: '#888' }}>{u.theme}</span>
                  </div>
                ))}
                {program.total_weeks > 4 && (
                  <p className="text-[11px]" style={{ color: '#444' }}>
                    + {program.total_weeks - 4} semanas adicionais personalizadas
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={saving}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-[14px] font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: '#FFFFFF', color: '#0C0B0A' }}
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
              ) : (
                <><Check className="h-4 w-4" /> Confirmar e começar</>
              )}
            </button>

            <button
              onClick={() => setStep('assessment')}
              className="w-full text-[12px] text-center py-2 transition-opacity hover:opacity-70"
              style={{ color: '#555' }}
            >
              Refazer avaliação
            </button>
          </div>
        )}
      </div>

      <style>{`
        .input-field {
          width: 100%;
          background: #1A1917;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 12px 16px;
          color: #FFF;
          font-size: 13px;
          letter-spacing: -0.012em;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus { border-color: rgba(255,255,255,0.2); }
        .input-field::placeholder { color: #444; }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function StepHeader({ step, total, title, subtitle }: { step: number; total: number; title: string; subtitle: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i < step ? '#FFFFFF' : 'rgba(255,255,255,0.12)' }}
          />
        ))}
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: '#555' }}>
          Passo {step} de {total}
        </p>
        <h2 className="text-white font-medium" style={{ fontSize: 22, letterSpacing: '-0.04em' }}>{title}</h2>
        <p className="text-[13px] mt-0.5" style={{ color: '#666' }}>{subtitle}</p>
      </div>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-[12px] font-medium" style={{ color: '#888' }}>
        {label}{required && <span style={{ color: '#F87171' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

function NavButtons({ onBack, onNext, nextDisabled, nextLabel }: {
  onBack: () => void
  onNext: () => void
  nextDisabled?: boolean
  nextLabel?: string
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 px-5 py-3 rounded-full text-[13px] font-medium"
        style={{ background: '#1A1917', color: '#666' }}
      >
        <ChevronLeft className="h-4 w-4" /> Voltar
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ background: '#FFFFFF', color: '#0C0B0A' }}
      >
        {nextLabel ?? 'Continuar'} <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
