import Link from 'next/link'
import { FileText, Clock } from 'lucide-react'
import { getPendingReportLessons } from '@/lib/queries/teacher'

export default async function PendingPage() {
  const lessons = await getPendingReportLessons()

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between px-8 border-b shrink-0" style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
        <h1 className="text-white font-medium" style={{ fontSize: 15, letterSpacing: '-0.015em' }}>Pendentes</h1>
        <span className="text-[12px]" style={{ color: '#555' }}>
          {lessons.length} relatório{lessons.length !== 1 ? 's' : ''} pendente{lessons.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="p-6 space-y-4">
        {lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24" style={{ color: '#444' }}>
            <FileText className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-[14px]">Nenhum relatório pendente</p>
            <p className="text-[12px] mt-1" style={{ color: '#333' }}>Você está em dia com todos os pós-aulas.</p>
          </div>
        ) : lessons.map((lesson: any) => {
          const hoursAgo = Math.floor((Date.now() - new Date(lesson.scheduled_at).getTime()) / 3600000)
          const initials = lesson.student?.full_name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') ?? '?'
          return (
            <div key={lesson.id} className="rounded-[20px] p-5 space-y-4" style={{ background: '#1A1917', border: '1px solid rgba(250,204,21,0.12)' }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold" style={{ background: 'rgba(250,204,21,0.12)', color: '#FACC15' }}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-white" style={{ letterSpacing: '-0.013em' }}>{lesson.student?.full_name}</p>
                    {lesson.unit && (
                      <p className="text-[11px] mt-0.5" style={{ color: '#555' }}>
                        Sem. {lesson.unit.week_number} · {lesson.unit.theme}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#FACC15' }}>
                  <Clock className="h-3.5 w-3.5" />
                  {hoursAgo < 24 ? `${hoursAgo}h atrás` : `${Math.floor(hoursAgo / 24)}d atrás`}
                </div>
              </div>

              {lesson.unit && (
                <div className="rounded-xl px-3 py-2 text-[11px]" style={{ background: '#252320', color: '#666' }}>
                  {lesson.unit.grammar_focus}
                  {lesson.unit.vocabulary?.length > 0 && ` · ${lesson.unit.vocabulary.slice(0, 4).join(', ')}…`}
                </div>
              )}

              {lesson.last_lesson_note && (
                <p className="text-[11px] italic" style={{ color: '#555' }}>📌 Obs anterior: {lesson.last_lesson_note}</p>
              )}

              <Link href={`/teacher/lessons/${lesson.id}/report`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[13px] font-medium transition-opacity hover:opacity-80"
                style={{ background: '#FACC15', color: '#0C0B0A' }}>
                <FileText className="h-3.5 w-3.5" />
                Preencher pós-aula
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
