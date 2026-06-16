import { Flame } from 'lucide-react'

interface Props {
  currentWeek: number
  totalWeeks: number
  theme: string
  streak: number
  engagementScore: number
}

export function ProgramProgress({ currentWeek, totalWeeks, theme, streak, engagementScore }: Props) {
  const pct = Math.round((currentWeek / totalWeeks) * 100)

  const engagementColor =
    engagementScore >= 70 ? '#4ADE80' : engagementScore >= 40 ? '#FACC15' : '#F87171'

  return (
    <div
      className="rounded-[20px] p-5 space-y-4 card-elevated"
      style={{ background: '#1A1917' }}
    >
      {/* Eyebrow */}
      <div className="flex items-center justify-between">
        <span
          className="text-[11px] font-medium uppercase tracking-[0.08em]"
          style={{ color: '#999' }}
        >
          Semana atual · {currentWeek}/{totalWeeks}
        </span>
        {streak > 0 && (
          <span
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium"
            style={{ background: '#252320', color: '#FACC15' }}
          >
            <Flame className="h-3 w-3" />
            {streak} dias seguidos
          </span>
        )}
      </div>

      {/* Display headline */}
      <h2
        className="text-white font-medium leading-[1.05]"
        style={{ fontSize: 'clamp(26px, 4vw, 38px)', letterSpacing: '-0.04em' }}
      >
        {theme}
      </h2>

      {/* Progress bar */}
      <div className="space-y-2">
        <div
          className="h-[3px] w-full rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: '#FFFFFF' }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px]" style={{ color: '#999', letterSpacing: '-0.013em' }}>
            {pct}% do semestre concluído
          </span>
          <span className="text-[13px] font-medium" style={{ color: engagementColor, letterSpacing: '-0.013em' }}>
            {engagementScore}% engajamento
          </span>
        </div>
      </div>
    </div>
  )
}
