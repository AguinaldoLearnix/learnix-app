interface Props {
  label: string
  current: number
  previous: number
  color: string
}

export function SkillBar({ label, current, previous, color }: Props) {
  const delta = current - previous
  const positive = delta >= 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-white" style={{ letterSpacing: '-0.012em' }}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-medium"
            style={{ color: positive ? '#4ADE80' : '#F87171' }}
          >
            {positive ? '+' : ''}{delta}
          </span>
          <span
            className="text-[14px] font-semibold tabular-nums text-white"
            style={{ letterSpacing: '-0.02em' }}
          >
            {current}
          </span>
        </div>
      </div>
      <div
        className="h-[6px] w-full rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        {/* Previous bar (lighter) */}
        <div className="relative h-full">
          <div
            className="absolute inset-y-0 left-0 rounded-full opacity-25"
            style={{ width: `${previous}%`, background: color }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{ width: `${current}%`, background: color }}
          />
        </div>
      </div>
    </div>
  )
}
