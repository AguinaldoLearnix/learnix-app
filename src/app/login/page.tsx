'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import { login, signInWithGoogle } from '@/app/auth/actions'

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    const result = await signInWithGoogle()
    if (result?.url) window.location.href = result.url
    else if (result?.error) setError(result.error)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0C0B0A' }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,153,255,0.08) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-sm space-y-8 relative">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#FFFFFF' }}>
            <GraduationCap className="h-6 w-6" style={{ color: '#0C0B0A' }} />
          </div>
          <div className="text-center">
            <h1 className="text-white font-semibold" style={{ fontSize: 24, letterSpacing: '-0.04em' }}>Learnix</h1>
            <p className="text-[13px] mt-1" style={{ color: '#555' }}>Seu espaço de aprendizagem</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-[24px] p-8 space-y-5" style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="text-white font-semibold" style={{ fontSize: 18, letterSpacing: '-0.025em' }}>Entrar</h2>
            <p className="text-[12px] mt-1" style={{ color: '#555' }}>Acesse sua conta para continuar</p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium" style={{ color: '#666' }}>E-mail</label>
              <input
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all"
                style={{ background: '#252320', color: '#FFF', border: '1px solid rgba(255,255,255,0.06)' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(0,153,255,0.4)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium" style={{ color: '#666' }}>Senha</label>
                <Link href="/reset-password" className="text-[11px]" style={{ color: '#0099FF' }}>Esqueceu a senha?</Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-10 rounded-xl text-[13px] outline-none transition-all"
                  style={{ background: '#252320', color: '#FFF', border: '1px solid rgba(255,255,255,0.06)' }}
                  onFocus={e => (e.target.style.borderColor = 'rgba(0,153,255,0.4)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#555' }}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[12px] px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.10)', color: '#F87171' }}>
                {error === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-60 mt-2"
              style={{ background: '#FFFFFF', color: '#0C0B0A' }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px]" style={{ color: '#555' }}>
          Ainda não tem conta?{' '}
          <Link href="/signup" className="font-medium" style={{ color: '#FFF' }}>Criar conta</Link>
        </p>
      </div>
    </div>
  )
}
