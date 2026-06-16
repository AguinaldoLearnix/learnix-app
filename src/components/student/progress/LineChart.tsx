'use client'

import { useState } from 'react'

interface Snapshot {
  month: string
  speaking: number
  listening: number
  reading: number
  writing: number
  uol: number
}

type Skill = 'speaking' | 'listening' | 'reading' | 'writing' | 'uol'

const SKILLS: { key: Skill; label: string; color: string }[] = [
  { key: 'speaking',  label: 'Speaking',   color: '#A78BFA' },
  { key: 'listening', label: 'Listening',  color: '#60A5FA' },
  { key: 'reading',   label: 'Reading',    color: '#4ADE80' },
  { key: 'writing',   label: 'Writing',    color: '#FACC15' },
  { key: 'uol',       label: 'Use of Language', color: '#F87171' },
]

interface Props {
  data: Snapshot[]
}

export function LineChart({ data }: Props) {
  const [active, setActive] = useState<Skill[]>(['speaking', 'listening'])
  const [hovered, setHovered] = useState<number | null>(null)

  const W = 600
  const H = 180
  const PAD = { top: 12, right: 20, bottom: 28, left: 28 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const xPos = (i: number) => PAD.left + (i / (data.length - 1)) * chartW
  const yPos = (v: number) => PAD.top + chartH - (v / 100) * chartH

  function buildPath(skill: Skill) {
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(d[skill])}`)
      .join(' ')
  }

  function toggleSkill(key: Skill) {
    setActive(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  return (
    <div className="space-y-4">
      {/* Legend toggles */}
      <div className="flex flex-wrap gap-2">
        {SKILLS.map(({ key, label, color }) => {
          const on = active.includes(key)
          return (
            <button
              key={key}
              onClick={() => toggleSkill(key)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all"
              style={{
                background: on ? `${color}18` : 'rgba(255,255,255,0.04)',
                color: on ? color : '#555',
                boxShadow: on ? `0 0 0 1px ${color}40` : undefined,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: on ? color : '#444' }}
              />
              {label}
            </button>
          )
        })}
      </div>

      {/* SVG chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full overflow-visible"
          onMouseLeave={() => setHovered(null)}
        >
          {/* Grid lines */}
          {[25, 50, 75, 100].map(v => (
            <g key={v}>
              <line
                x1={PAD.left} y1={yPos(v)}
                x2={W - PAD.right} y2={yPos(v)}
                stroke="rgba(255,255,255,0.05)" strokeWidth={1}
              />
              <text
                x={PAD.left - 6} y={yPos(v)}
                fill="#444" fontSize={9}
                textAnchor="end" dominantBaseline="middle"
              >
                {v}
              </text>
            </g>
          ))}

          {/* Month labels */}
          {data.map((d, i) => (
            <text
              key={i}
              x={xPos(i)} y={H - 6}
              fill={hovered === i ? '#FFF' : '#555'}
              fontSize={10} textAnchor="middle"
            >
              {d.month}
            </text>
          ))}

          {/* Hover vertical */}
          {hovered !== null && (
            <line
              x1={xPos(hovered)} y1={PAD.top}
              x2={xPos(hovered)} y2={H - PAD.bottom}
              stroke="rgba(255,255,255,0.12)" strokeWidth={1} strokeDasharray="3,3"
            />
          )}

          {/* Lines */}
          {SKILLS.filter(s => active.includes(s.key)).map(({ key, color }) => (
            <g key={key}>
              <path
                d={buildPath(key)}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dots */}
              {data.map((d, i) => (
                <circle
                  key={i}
                  cx={xPos(i)} cy={yPos(d[key])}
                  r={hovered === i ? 4 : 3}
                  fill={hovered === i ? color : '#0C0B0A'}
                  stroke={color}
                  strokeWidth={2}
                />
              ))}
            </g>
          ))}

          {/* Invisible hover targets */}
          {data.map((_, i) => (
            <rect
              key={i}
              x={xPos(i) - 20} y={PAD.top}
              width={40} height={chartH}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
            />
          ))}
        </svg>

        {/* Tooltip */}
        {hovered !== null && (
          <div
            className="absolute pointer-events-none rounded-xl p-3 space-y-1 shadow-lg"
            style={{
              background: '#252320',
              border: '1px solid rgba(255,255,255,0.08)',
              top: 10,
              left: `calc(${(hovered / (data.length - 1)) * 100}% + 10px)`,
              transform: hovered > data.length / 2 ? 'translateX(calc(-100% - 20px))' : undefined,
              minWidth: 120,
            }}
          >
            <p className="text-[11px] font-semibold text-white">
              {data[hovered].month}
            </p>
            {SKILLS.filter(s => active.includes(s.key)).map(({ key, label, color }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <span className="text-[11px]" style={{ color }}>{label}</span>
                <span className="text-[11px] font-semibold text-white tabular-nums">
                  {data[hovered][key]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
