import { Calendar, Clock, Video, RefreshCw } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import type { Lesson } from '@/types'

interface Props {
  lesson: Lesson
}

export function UpcomingLesson({ lesson }: Props) {
  const teacherName = lesson.teacher?.full_name ?? 'Professor'
  const initials = teacherName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <section className="space-y-3">
      <span
        className="block text-[11px] font-medium uppercase tracking-[0.08em] px-0.5"
        style={{ color: '#999' }}
      >
        Próxima aula
      </span>

      {/* Gradient spotlight card (violet) */}
      <div
        className="gradient-violet rounded-[30px] p-6 space-y-5"
      >
        {/* Teacher row */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-medium shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#FFF' }}
          >
            {initials}
          </div>
          <div>
            <p
              className="text-white font-medium text-[15px]"
              style={{ letterSpacing: '-0.015em' }}
            >
              {teacherName}
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Professor
            </p>
          </div>
        </div>

        {/* Date/time display */}
        <div>
          <p
            className="text-white font-medium leading-[1.05]"
            style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', letterSpacing: '-0.04em' }}
          >
            {formatDate(lesson.scheduled_at, { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <p
            className="text-[15px] mt-1"
            style={{ color: 'rgba(255,255,255,0.60)', letterSpacing: '-0.015em' }}
          >
            {formatTime(lesson.scheduled_at)} · {lesson.duration_min} minutos
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <a
            href={lesson.meet_url ?? '#'}
            target="_blank"
            rel="noreferrer"
            className="flex flex-1 items-center justify-center gap-2 py-[10px] rounded-full text-[13px] font-medium tracking-[-0.014em] transition-opacity hover:opacity-90"
            style={{ background: '#FFFFFF', color: '#0C0B0A' }}
          >
            <Video className="h-3.5 w-3.5" />
            Entrar na aula
          </a>
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full transition-opacity hover:opacity-70 shrink-0"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#FFF' }}
            title="Reagendar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
