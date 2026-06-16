'use client'

import { Check, BookText, Headphones, FileEdit, Brain } from 'lucide-react'
import type { WeeklyUnit } from '@/types'

interface PreLessonStatus {
  vocabularyViewed: boolean
  textViewed: boolean
  audioViewed: boolean
  preLessonTaskDone: boolean
}

interface Props {
  unit: WeeklyUnit
  status: PreLessonStatus
}

export function PreLessonSection({ unit, status }: Props) {
  const items = [
    {
      icon: Brain,
      label: `Vocabulário da semana`,
      sub: `${unit.vocabulary.length} palavras`,
      done: status.vocabularyViewed,
      href: '/student/pre-lesson',
    },
    {
      icon: BookText,
      label: 'Texto de preparação',
      sub: 'Leitura · ~5 min',
      done: status.textViewed,
      href: '/student/pre-lesson',
    },
    {
      icon: Headphones,
      label: 'Podcast',
      sub: 'Business meetings in English',
      done: status.audioViewed,
      href: unit.pre_lesson_audio_url || '/student/pre-lesson',
    },
    {
      icon: FileEdit,
      label: 'Tarefa pré-aula',
      sub: unit.pre_lesson_task ? unit.pre_lesson_task.slice(0, 52) + '…' : 'Ver instruções',
      done: status.preLessonTaskDone,
      href: '/student/pre-lesson',
    },
  ]

  const doneCount = items.filter(i => i.done).length
  const allDone = doneCount === items.length

  return (
    <section className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between px-0.5">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.08em]"
          style={{ color: '#999' }}
        >
          Pré-aula
        </span>
        <span className="text-[12px]" style={{ color: '#999' }}>
          {doneCount}/{items.length} concluídos
        </span>
      </div>

      {/* Item list */}
      <div
        className="rounded-[20px] overflow-hidden divide-y"
        style={{ background: '#1A1917' } as React.CSSProperties}
      >
        {items.map(({ icon: Icon, label, sub, done, href }) => (
          <a
            key={label}
            href={href}
            className="flex items-center gap-3.5 px-5 py-4 group transition-colors"
            style={{ '--hover-bg': '#252320' } as React.CSSProperties}
            onMouseEnter={e => (e.currentTarget.style.background = '#252320')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: done ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)' }}
            >
              <Icon
                className="h-3.5 w-3.5"
                style={{ color: done ? '#4ADE80' : '#999' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[14px] font-medium leading-snug"
                style={{
                  color: done ? '#999' : '#FFF',
                  letterSpacing: '-0.014em',
                  textDecoration: done ? 'line-through' : 'none',
                  textDecorationColor: '#666',
                }}
              >
                {label}
              </p>
              <p className="text-[12px] mt-0.5 truncate" style={{ color: '#666' }}>
                {sub}
              </p>
            </div>
            {done ? (
              <Check className="h-4 w-4 shrink-0" style={{ color: '#4ADE80' }} />
            ) : (
              <div
                className="h-4 w-4 shrink-0 rounded-full border"
                style={{ borderColor: 'rgba(255,255,255,0.15)' }}
              />
            )}
          </a>
        ))}
      </div>

      {/* CTA */}
      {!allDone && (
        <a
          href="/student/practice?mode=vocabulary"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-[13px] font-medium tracking-[-0.013em] transition-opacity hover:opacity-80"
          style={{ background: '#1A1917', color: '#FFF' }}
        >
          <Brain className="h-3.5 w-3.5" />
          Praticar vocabulário com IA
        </a>
      )}
    </section>
  )
}
