import { Brain } from 'lucide-react'

interface Props {
  vocabulary: string[]
  totalLearned: number
}

export function VocabPanel({ vocabulary, totalLearned }: Props) {
  return (
    <div
      className="rounded-[20px] p-5 space-y-4"
      style={{ background: '#1A1917' }}
    >
      <div className="flex items-center justify-between">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.08em]"
          style={{ color: '#555' }}
        >
          Vocabulário da semana
        </p>
        <span
          className="text-[11px] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(167,139,250,0.12)', color: '#A78BFA' }}
        >
          {vocabulary.length} palavras
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {vocabulary.map(word => (
          <span
            key={word}
            className="px-2.5 py-1 rounded-full text-[12px] font-medium cursor-default transition-colors hover:bg-white/10"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: '#CCC',
              letterSpacing: '-0.012em',
            }}
          >
            {word}
          </span>
        ))}
      </div>

      <div
        className="flex items-center justify-between border-t pt-3"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}
      >
        <span className="text-[12px]" style={{ color: '#555' }}>
          {totalLearned} palavras aprendidas no semestre
        </span>
        <a
          href="/student/practice?mode=vocabulary"
          className="flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-70"
          style={{ color: '#A78BFA' }}
        >
          <Brain className="h-3.5 w-3.5" />
          Praticar
        </a>
      </div>
    </div>
  )
}
