import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'Diagnóstico', short: 'Diagnóstico' },
  { id: 2, label: 'Programa', short: 'Programa' },
  { id: 3, label: 'Pré-aula', short: 'Pré-aula' },
  { id: 4, label: 'Aula ao vivo', short: 'Aula' },
  { id: 5, label: 'Pós-aula', short: 'Pós-aula' },
  { id: 6, label: 'Prática IA', short: 'IA' },
  { id: 7, label: 'Tarefa', short: 'Tarefa' },
  { id: 8, label: 'Revisão', short: 'Revisão' },
]

interface Props {
  currentStep: number // 1-8
}

export function ProcessPipeline({ currentStep }: Props) {
  return (
    <div
      className="rounded-[16px] px-5 py-4"
      style={{ background: '#1A1917' }}
    >
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const done = step.id < currentStep
          const active = step.id === currentStep
          const upcoming = step.id > currentStep
          const isLast = i === STEPS.length - 1

          return (
            <div key={step.id} className="flex items-center flex-1 min-w-0">
              {/* Node */}
              <div className="flex flex-col items-center gap-1.5 min-w-0 flex-shrink-0">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: done
                      ? '#4ADE80'
                      : active
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.06)',
                    boxShadow: active
                      ? '0 0 0 3px rgba(255,255,255,0.12)'
                      : undefined,
                  }}
                >
                  {done ? (
                    <Check
                      className="h-3 w-3"
                      style={{ color: '#0C0B0A', strokeWidth: 3 }}
                    />
                  ) : (
                    <span
                      className="text-[9px] font-semibold tabular-nums"
                      style={{ color: active ? '#0C0B0A' : '#555' }}
                    >
                      {step.id}
                    </span>
                  )}
                </div>
                <span
                  className="text-[10px] font-medium text-center leading-tight w-12 truncate"
                  style={{
                    color: done ? '#4ADE80' : active ? '#FFFFFF' : '#555',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {step.short}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className="flex-1 h-[1px] mx-1 mb-5"
                  style={{
                    background: done
                      ? '#4ADE80'
                      : 'rgba(255,255,255,0.08)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
