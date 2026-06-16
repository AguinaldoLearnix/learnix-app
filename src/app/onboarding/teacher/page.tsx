'use client'

import { useState } from 'react'
import { GraduationCap, ChevronRight, ChevronLeft, Loader2, Check } from 'lucide-react'
import { completeTeacherOnboarding } from '../actions'

const LANGUAGE_OPTIONS = ['Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano', 'Mandarim', 'Português']
const SPECIALTY_OPTIONS = [
  'Business English', 'Conversação', 'Preparatório IELTS', 'Preparatório TOEFL',
  'Inglês Técnico', 'Inglês Jurídico', 'Gramática', 'Pronúncia', 'Escrita Acadêmica',
]

type Step = 'languages' | 'profile' | 'done'

export default function TeacherOnboarding() {
  const [step, setStep] = useState<Step>('languages')
  const [saving, setSaving] = useState(false)

  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['Inglês'])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [ratePerHour, setRatePerHour] = useState(80)
  const [maxStudents, setMaxStudents] = useState(10)

  function toggleItem(list: string[], setList: (l: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter(x => x !== item) : [...list, item])
  }

  async function handleSave() {
    setSaving(true)
    try {
      await completeTeacherOnboarding({
        languages: selectedLanguages,
        specialties: selectedSpecialties,
        bio,
        rate_per_hour: ratePerHour,
        max_students: maxStudents,
      })
    } catch {
      setSaving(false)
    }
  }

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

      <div className="w-full max-w-lg space-y-6">

        {/* Step indicator */}
        <div>
          <div className="flex gap-2 mb-4">
            {(['languages', 'profile'] as Step[]).map((s, i) => (
              <div
                key={s}
                className="h-1 flex-1 rounded-full transition-all"
                style={{ background: (step === 'languages' ? i < 1 : i < 2) ? '#FACC15' : 'rgba(255,255,255,0.10)' }}
              />
            ))}
          </div>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-[0.08em] mb-2"
            style={{ background: 'rgba(250,204,21,0.12)', color: '#FACC15' }}
          >
            Professor
          </div>
          <h2 className="text-white font-medium" style={{ fontSize: 22, letterSpacing: '-0.04em' }}>
            {step === 'languages' ? 'Seu perfil de ensino' : 'Sobre você'}
          </h2>
          <p className="text-[13px] mt-0.5" style={{ color: '#666' }}>
            {step === 'languages' ? 'Quais idiomas e especialidades você oferece?' : 'Complete seu perfil para que os alunos conheçam você.'}
          </p>
        </div>

        {/* ── LANGUAGES & SPECIALTIES ── */}
        {step === 'languages' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[12px] font-medium" style={{ color: '#888' }}>Idiomas que você ensina</label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map(lang => (
                  <button
                    key={lang}
                    onClick={() => toggleItem(selectedLanguages, setSelectedLanguages, lang)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                    style={{
                      background: selectedLanguages.includes(lang) ? '#FACC15' : '#1A1917',
                      color: selectedLanguages.includes(lang) ? '#0C0B0A' : '#666',
                    }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[12px] font-medium" style={{ color: '#888' }}>Especialidades</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTY_OPTIONS.map(sp => (
                  <button
                    key={sp}
                    onClick={() => toggleItem(selectedSpecialties, setSelectedSpecialties, sp)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
                    style={{
                      background: selectedSpecialties.includes(sp) ? '#FFFFFF' : '#1A1917',
                      color: selectedSpecialties.includes(sp) ? '#0C0B0A' : '#666',
                    }}
                  >
                    {sp}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep('profile')}
              disabled={selectedLanguages.length === 0}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-[14px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: '#FACC15', color: '#0C0B0A' }}
            >
              Continuar <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── PROFILE ── */}
        {step === 'profile' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[12px] font-medium" style={{ color: '#888' }}>Bio profissional</label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Conte sobre sua experiência, metodologia e diferenciais como professor..."
                rows={4}
                className="w-full rounded-[14px] px-4 py-3 text-[13px] resize-none outline-none"
                style={{
                  background: '#1A1917',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#FFF',
                  letterSpacing: '-0.012em',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[12px] font-medium" style={{ color: '#888' }}>Valor por hora (R$)</label>
                <input
                  type="number"
                  value={ratePerHour}
                  onChange={e => setRatePerHour(Number(e.target.value))}
                  className="w-full rounded-[14px] px-4 py-3 text-[13px] outline-none"
                  style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.08)', color: '#FFF' }}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[12px] font-medium" style={{ color: '#888' }}>Máx. de alunos</label>
                <input
                  type="number"
                  value={maxStudents}
                  onChange={e => setMaxStudents(Number(e.target.value))}
                  className="w-full rounded-[14px] px-4 py-3 text-[13px] outline-none"
                  style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.08)', color: '#FFF' }}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('languages')}
                className="flex items-center gap-1.5 px-5 py-3 rounded-full text-[13px] font-medium"
                style={{ background: '#1A1917', color: '#666' }}
              >
                <ChevronLeft className="h-4 w-4" /> Voltar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[14px] font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
                style={{ background: '#FACC15', color: '#0C0B0A' }}
              >
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
                ) : (
                  <><Check className="h-4 w-4" /> Concluir cadastro</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
