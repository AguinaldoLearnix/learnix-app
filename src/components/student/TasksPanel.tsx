import Link from 'next/link'
import { Mic, FileText, AlertTriangle, Clock, ChevronRight } from 'lucide-react'
import { daysUntil } from '@/lib/utils'
import type { Task } from '@/types'

const typeIcon = { audio: Mic, text: FileText, quiz: FileText, reading: FileText }
const typeLabel = { audio: 'Áudio', text: 'Texto', quiz: 'Quiz', reading: 'Leitura' }

export function TasksPanel({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) return null

  return (
    <div
      className="rounded-[20px] overflow-hidden"
      style={{ background: '#1A1917' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <p
          className="text-[11px] font-medium uppercase tracking-[0.08em]"
          style={{ color: '#555' }}
        >
          Tarefas pendentes
        </p>
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#F87171' }}
        >
          {tasks.length}
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {tasks.map(task => {
          const Icon = typeIcon[task.type]
          const isLate = task.status === 'late'
          const days = daysUntil(task.due_at)

          return (
            <Link
              key={task.id}
              href={`/student/tasks/${task.id}`}
              className="flex items-center gap-3.5 px-5 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div
                className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: isLate
                    ? 'rgba(239,68,68,0.12)'
                    : 'rgba(255,255,255,0.05)',
                }}
              >
                <Icon
                  className="h-3.5 w-3.5"
                  style={{ color: isLate ? '#F87171' : '#555' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className="text-[13px] font-medium leading-snug truncate"
                  style={{ color: '#CCC', letterSpacing: '-0.013em' }}
                >
                  {task.instruction}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#666' }}
                  >
                    {typeLabel[task.type]}
                  </span>
                  {isLate ? (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: '#F87171' }}>
                      <AlertTriangle className="h-3 w-3" />
                      Atrasada
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: '#555' }}>
                      <Clock className="h-3 w-3" />
                      {days <= 0 ? 'Hoje' : `${days}d restante${days !== 1 ? 's' : ''}`}
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0" style={{ color: isLate ? '#F87171' : '#555' }} />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
