import { Mic, FileText, AlertTriangle, Clock } from 'lucide-react'
import { daysUntil } from '@/lib/utils'
import type { Task } from '@/types'

interface Props {
  tasks: Task[]
}

const typeIcon = { audio: Mic, text: FileText, quiz: FileText, reading: FileText }

export function PendingTasks({ tasks }: Props) {
  if (tasks.length === 0) return null

  return (
    <section className="space-y-3">
      <span
        className="block text-[11px] font-medium uppercase tracking-[0.08em] px-0.5"
        style={{ color: '#999' }}
      >
        Tarefas pendentes
      </span>

      <div className="space-y-2">
        {tasks.map(task => {
          const Icon = typeIcon[task.type]
          const isLate = task.status === 'late'
          const days = daysUntil(task.due_at)

          return (
            <div
              key={task.id}
              className="rounded-[20px] p-5 space-y-4 card-elevated"
              style={{ background: isLate ? 'rgba(239,68,68,0.08)' : '#1A1917' }}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <div
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
                  style={{
                    background: isLate ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    style={{ color: isLate ? '#F87171' : '#999' }}
                  />
                </div>
                <div className="flex-1">
                  <p
                    className="text-[14px] font-medium leading-snug"
                    style={{ color: '#FFF', letterSpacing: '-0.014em' }}
                  >
                    {task.instruction}
                  </p>

                  <div className="flex items-center gap-1.5 mt-2">
                    {isLate ? (
                      <>
                        <AlertTriangle className="h-3 w-3" style={{ color: '#F87171' }} />
                        <span className="text-[12px] font-medium" style={{ color: '#F87171' }}>
                          Atrasada
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" style={{ color: '#999' }} />
                        <span className="text-[12px]" style={{ color: '#999' }}>
                          {days <= 0
                            ? 'Vence hoje'
                            : `${days} dia${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <button
                className="flex items-center justify-center gap-2 w-full py-[10px] rounded-full text-[13px] font-medium tracking-[-0.013em] transition-opacity hover:opacity-80"
                style={{
                  background: isLate ? '#EF4444' : '#FFFFFF',
                  color: isLate ? '#FFF' : '#0C0B0A',
                }}
              >
                {isLate ? (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Entregar agora
                  </>
                ) : task.type === 'audio' ? (
                  <>
                    <Mic className="h-3.5 w-3.5" />
                    Gravar áudio
                  </>
                ) : (
                  <>
                    <FileText className="h-3.5 w-3.5" />
                    Escrever resposta
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
