'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { GraduationCap, Eye, EyeOff, ChevronRight } from 'lucide-react'
import { signup, signInWithGoogle } from '@/app/auth/actions'

type Step = 'role' | 'account' | 'profile'

const LANGUAGES = [
  { value: 'english', label: 'Inglês' },
  { value: 'spanish', label: 'Espanhol' },
]
const LEVELS = [
  { value: 'A1', label: 'A1', desc: 'Iniciante' },
  { value: 'A2', label: 'A2', desc: 'Básico' },
  { value: 'B1', label: 'B1', desc: 'Intermediário' },
  { value: 'B2', label: 'B2', desc: 'Interm. superior' },
  { value: 'C1', label: 'C1', desc: 'Avançado' },
  { value: 'C2', label: 'C2', desc: 'Proficiente' },
]
const GOALS = [
  { value: 'work',      label: '💼 Trabalho / carreira' },
  { value: 'travel',    label: '✈️ Viagens' },
  { value: 'interview', label: '🎯 Entrevistas de emprego' },
  { value: 'exam',      label: '📝 Certificação (IELTS/TOEFL)' },
]

function SignupForm() {
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get('invite')

  const [step, setStep] = useState<Step>(inviteToken ? 'account' : 'role')
  const [role, setRole] = useState<'student' | 'teacher'>('student')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    full_name: '', email: '', password: '',
    language: 'english', current_level: 'B1', goal: 'work',
  })

  function set(field: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleGoogle() {
    const result = await signInWithGoogle()
    if (result?.url) window.location.href = result.url
    else if (result?.error) setError(result.error)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.set(k, v))
    fd.set('role', inviteToken ? 'student' : role)
    if (inviteToken) fd.set('invite_token', inviteToken)
    const result = await signup(fd)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0C0B0A' }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(167,139,250,0.07) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-sm space-y-8 relative">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#FFFFFF' }}>
            <GraduationCap className="h-6 w-6" style={{ color: '#0C0B0A' }} />
          </div>
          <div className="text-center">
            <h1 className="text-white font-semibold" style={{ fontSize: 24, letterSpacing: '-0.04em' }}>Criar conta</h1>
            <p className="text-[13px] mt-1" style={{ color: '#555' }}>
              {step === 'role' ? 'Como você vai usar a Learnix?' :
               step === 'account' ? (role === 'teacher' ? 'Passo 1 de 1 · Dados da conta' : 'Passo 1 de 2 · Dados da conta') :
               'Passo 2 de 2 · Seu perfil de aprendizagem'}
            </p>
          </div>

          {inviteToken && (
            <div
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-medium"
              style={{ background: 'rgba(74,222,128,0.10)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' }}
            >
              <span>✓</span>
              <span>Convite válido — você será atribuído ao seu professor automaticamente</span>
            </div>
          )}
        </div>

        {/* Progress bar — only show after role selection */}
        {step !== 'role' && role === 'student' && (
          <div className="flex gap-1.5">
            {(['account', 'profile'] as Step[]).map((s, i) => (
              <div
                key={s}
                className="flex-1 h-[3px] rounded-full transition-all"
                style={{ background: i === 0 || step === 'profile' ? '#FFFFFF' : 'rgba(255,255,255,0.12)' }}
              />
            ))}
          </div>
        )}

        {/* Card */}
        <div className="rounded-[24px] p-8 space-y-5" style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.07)' }}>

          {step === 'role' ? (
            <div className="space-y-4">
              <p className="text-[12px]" style={{ color: '#555' }}>Selecione seu perfil para personalizar sua experiência.</p>
              {[
                {
                  value: 'student' as const,
                  label: 'Sou aluno',
                  desc: 'Quero aprender inglês ou espanhol com um professor',
                  accent: '#0099FF',
                  bg: 'rgba(0,153,255,0.08)',
                  border: 'rgba(0,153,255,0.25)',
                },
                {
                  value: 'teacher' as const,
                  label: 'Sou professor',
                  desc: 'Quero gerenciar alunos, programas e aulas',
                  accent: '#FACC15',
                  bg: 'rgba(250,204,21,0.08)',
                  border: 'rgba(250,204,21,0.25)',
                },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setRole(opt.value); setStep('account') }}
                  className="w-full p-5 rounded-[18px] text-left transition-all hover:scale-[1.01]"
                  style={{
                    background: opt.bg,
                    border: `1px solid ${opt.border}`,
                  }}
                >
                  <p className="text-[15px] font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>{opt.label}</p>
                  <p className="text-[12px] mt-1" style={{ color: '#666' }}>{opt.desc}</p>
                </button>
              ))}
              <p className="text-center text-[11px]" style={{ color: '#444' }}>
                Aluno com convite? Use o link enviado pelo seu professor.
              </p>
            </div>
          ) : step === 'account' ? (
            <>
              {/* Back to role */}
              {!inviteToken && (
                <button
                  type="button"
                  onClick={() => setStep('role')}
                  className="flex items-center gap-1 text-[12px] mb-1 transition-opacity hover:opacity-70"
                  style={{ color: '#555' }}
                >
                  ← Voltar
                </button>
              )}

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-full text-[13px] font-medium transition-opacity hover:opacity-80"
                style={{ background: '#252320', color: '#FFF', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar com Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-[11px]" style={{ color: '#444' }}>ou</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium" style={{ color: '#666' }}>Nome completo</label>
                  <input
                    value={form.full_name}
                    onChange={e => set('full_name', e.target.value)}
                    placeholder="João Silva"
                    required
                    className="w-full px-4 py-3 rounded-xl text-[13px] outline-none"
                    style={{ background: '#252320', color: '#FFF', border: '1px solid rgba(255,255,255,0.06)' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(0,153,255,0.4)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium" style={{ color: '#666' }}>E-mail</label>
                  <input
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    type="email"
                    placeholder="seu@email.com"
                    required
                    className="w-full px-4 py-3 rounded-xl text-[13px] outline-none"
                    style={{ background: '#252320', color: '#FFF', border: '1px solid rgba(255,255,255,0.06)' }}
                    onFocus={e => (e.target.style.borderColor = 'rgba(0,153,255,0.4)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium" style={{ color: '#666' }}>Senha</label>
                  <div className="relative">
                    <input
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      type={showPw ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      required minLength={8}
                      className="w-full px-4 py-3 pr-10 rounded-xl text-[13px] outline-none"
                      style={{ background: '#252320', color: '#FFF', border: '1px solid rgba(255,255,255,0.06)' }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(0,153,255,0.4)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#555' }}>
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {role === 'student' ? (
                  <button
                    type="button"
                    disabled={!form.full_name || !form.email || form.password.length < 8}
                    onClick={() => setStep('profile')}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[13px] font-semibold mt-2 transition-opacity hover:opacity-80 disabled:opacity-40"
                    style={{ background: '#FFFFFF', color: '#0C0B0A' }}
                  >
                    Próximo <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!form.full_name || !form.email || form.password.length < 8 || loading}
                    onClick={async () => {
                      setLoading(true)
                      setError('')
                      const fd = new FormData()
                      Object.entries(form).forEach(([k, v]) => fd.set(k, v))
                      fd.set('role', 'teacher')
                      const result = await signup(fd)
                      if (result?.error) { setError(result.error); setLoading(false) }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-[13px] font-semibold mt-2 transition-opacity hover:opacity-80 disabled:opacity-40"
                    style={{ background: '#FACC15', color: '#0C0B0A' }}
                  >
                    {loading ? 'Criando…' : 'Criar conta de professor'}
                  </button>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Language */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium" style={{ color: '#666' }}>Idioma</label>
                <div className="flex gap-2">
                  {LANGUAGES.map(l => (
                    <button key={l.value} type="button" onClick={() => set('language', l.value)}
                      className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all"
                      style={{ background: form.language === l.value ? '#FFFFFF' : '#252320', color: form.language === l.value ? '#0C0B0A' : '#666' }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium" style={{ color: '#666' }}>Nível atual</label>
                <div className="grid grid-cols-3 gap-2">
                  {LEVELS.map(l => (
                    <button key={l.value} type="button" onClick={() => set('current_level', l.value)}
                      className="py-2.5 rounded-xl text-center transition-all"
                      style={{
                        background: form.current_level === l.value ? 'rgba(167,139,250,0.15)' : '#252320',
                        border: form.current_level === l.value ? '1px solid rgba(167,139,250,0.4)' : '1px solid transparent',
                      }}>
                      <p className="text-[13px] font-semibold" style={{ color: form.current_level === l.value ? '#A78BFA' : '#FFF' }}>{l.label}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: '#555' }}>{l.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <label className="text-[11px] font-medium" style={{ color: '#666' }}>Objetivo principal</label>
                <div className="space-y-1.5">
                  {GOALS.map(g => (
                    <button key={g.value} type="button" onClick={() => set('goal', g.value)}
                      className="w-full px-3 py-2.5 rounded-xl text-left text-[12px] font-medium transition-all"
                      style={{
                        background: form.goal === g.value ? 'rgba(0,153,255,0.12)' : '#252320',
                        color: form.goal === g.value ? '#0099FF' : '#666',
                        border: form.goal === g.value ? '1px solid rgba(0,153,255,0.3)' : '1px solid transparent',
                      }}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-[12px] px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.10)', color: '#F87171' }}>
                  {error}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setStep('account')}
                  className="flex-1 py-3 rounded-full text-[13px] font-medium"
                  style={{ background: '#252320', color: '#999' }}>
                  Voltar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 py-3 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-60"
                  style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
                  {loading ? 'Criando…' : 'Criar conta'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-[12px]" style={{ color: '#555' }}>
          Já tem uma conta?{' '}
          <Link href="/login" className="font-medium" style={{ color: '#FFF' }}>Entrar</Link>
        </p>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  )
}
