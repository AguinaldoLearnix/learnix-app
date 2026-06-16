interface Props {
  weekNumber: number
  totalWeeks: number
  theme: string
  grammarFocus: string
  canDoStatements: string[]
}

export function WeekHeader({ weekNumber, totalWeeks, theme, grammarFocus, canDoStatements }: Props) {
  const pct = Math.round((weekNumber / totalWeeks) * 100)

  return (
    <div
      className="rounded-[20px] p-6 space-y-4 card-elevated"
      style={{ background: '#1A1917' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p
            className="text-[11px] font-medium uppercase tracking-[0.08em]"
            style={{ color: '#555' }}
          >
            Semana {weekNumber} de {totalWeeks}
          </p>
          <h2
            className="text-white font-medium leading-[1.05]"
            style={{ fontSize: 'clamp(22px, 3vw, 30px)', letterSpacing: '-0.04em' }}
          >
            {theme}
          </h2>
          <p
            className="text-[13px]"
            style={{ color: '#666', letterSpacing: '-0.013em' }}
          >
            Gramática · {grammarFocus}
          </p>
        </div>

        {/* Circular progress */}
        <CircularProgress pct={pct} />
      </div>

      {/* Can-do statements */}
      <div
        className="border-t pt-4 space-y-1.5"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <p
          className="text-[10px] font-medium uppercase tracking-[0.08em]"
          style={{ color: '#555' }}
        >
          Ao final desta semana você vai conseguir
        </p>
        {canDoStatements.map((s, i) => (
          <div key={i} className="flex items-start gap-2">
            <span
              className="shrink-0 mt-0.5 text-[11px] font-semibold"
              style={{ color: '#4ADE80' }}
            >
              →
            </span>
            <p className="text-[12px] leading-snug" style={{ color: '#999', letterSpacing: '-0.012em' }}>
              {s}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function CircularProgress({ pct }: { pct: number }) {
  const r = 20
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="relative w-[56px] h-[56px] shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle
          cx="28" cy="28" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="3"
        />
        <circle
          cx="28" cy="28" r={r}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-[13px] font-semibold text-white leading-none tabular-nums"
          style={{ letterSpacing: '-0.02em' }}
        >
          {pct}%
        </span>
        <span className="text-[9px] mt-0.5" style={{ color: '#555' }}>
          semestre
        </span>
      </div>
    </div>
  )
}
