'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, BookOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function RolePicker() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function pickRole(role: 'student' | 'teacher') {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await supabase.from('users').update({ role }).eq('id', user.id)

    router.push(role === 'teacher' ? '/onboarding/teacher' : '/onboarding')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0C0B0A' }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-white" style={{ letterSpacing: '-0.03em' }}>
            Você é...
          </h1>
          <p className="text-sm" style={{ color: '#666' }}>Escolha como quer usar o Learnix</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => pickRole('student')}
            disabled={loading}
            className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all disabled:opacity-50"
            style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0,153,255,0.15)' }}>
              <BookOpen className="w-5 h-5" style={{ color: '#0099FF' }} />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Sou aluno</p>
              <p className="text-xs mt-0.5" style={{ color: '#666' }}>Quero aprender inglês com IA</p>
            </div>
          </button>

          <button
            onClick={() => pickRole('teacher')}
            disabled={loading}
            className="w-full flex items-center gap-4 p-5 rounded-2xl text-left transition-all disabled:opacity-50"
            style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(250,204,21,0.15)' }}>
              <GraduationCap className="w-5 h-5" style={{ color: '#FACC15' }} />
            </div>
            <div>
              <p className="text-white font-medium text-sm">Sou professor</p>
              <p className="text-xs mt-0.5" style={{ color: '#666' }}>Quero gerenciar meus alunos</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
