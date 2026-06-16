import { Video, RefreshCw, Calendar, Clock } from 'lucide-react'
import { formatDate, formatTime } from '@/lib/utils'
import type { Lesson } from '@/types'

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const teacherName = lesson.teacher?.full_name ?? 'Professor'
  const initials = teacherName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="gradient-violet rounded-[20px] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.08em]"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          Próxima aula
        </p>
        <button
          className="flex items-center justify-center w-7 h-7 rounded-full transition-opacity hover:opacity-70"
          style={{ background: 'rgba(255,255,255,0.10)', color: '#FFF' }}
          title="Reagendar"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold shrink-0"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#FFF' }}
        >
          {initials}
        </div>
        <div>
          <p className="text-white font-medium text-[14px]" style={{ letterSpacing: '-0.014em' }}>
            {teacherName}
          </p>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Professor
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.70)' }}>
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span className="text-[13px]" style={{ letterSpacing: '-0.013em' }}>
            {formatDate(lesson.scheduled_at, { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.70)' }}>
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="text-[13px]" style={{ letterSpacing: '-0.013em' }}>
            {formatTime(lesson.scheduled_at)} · {lesson.duration_min} min
          </span>
        </div>
      </div>

      <a
        href={lesson.meet_url ?? '#'}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[13px] font-medium tracking-[-0.013em] transition-opacity hover:opacity-90"
        style={{ background: '#FFFFFF', color: '#0C0B0A' }}
      >
        <Video className="h-3.5 w-3.5" />
        Entrar na aula
      </a>
    </div>
  )
}
