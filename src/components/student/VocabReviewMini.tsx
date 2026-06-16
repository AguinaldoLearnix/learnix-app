import { Brain, ArrowRight } from 'lucide-react'
import type { VocabReview } from '@/types'

export function VocabReviewMini({ reviews }: { reviews: VocabReview[] }) {
  if (reviews.length === 0) return null

  return (
    <div className="gradient-coral rounded-[20px] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.08em]"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          Revisão · Spaced repetition
        </p>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.12)' }}
        >
          <Brain className="h-3.5 w-3.5 text-white" />
        </div>
      </div>

      <div>
        <p
          className="text-white font-medium leading-none"
          style={{ fontSize: 28, letterSpacing: '-0.05em' }}
        >
          {reviews.length} palavras
        </p>
        <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.50)' }}>
          aguardando revisão hoje
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {reviews.slice(0, 4).map(r => (
          <span
            key={r.id}
            className="px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{ background: 'rgba(255,255,255,0.12)', color: '#FFF' }}
          >
            {r.word}
          </span>
        ))}
        {reviews.length > 4 && (
          <span
            className="px-2 py-0.5 rounded-full text-[11px]"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.40)' }}
          >
            +{reviews.length - 4}
          </span>
        )}
      </div>

      <a
        href="/student/vocab-review"
        className="flex items-center justify-between w-full px-4 py-2.5 rounded-full text-[13px] font-medium tracking-[-0.013em] transition-opacity hover:opacity-90"
        style={{ background: '#FFFFFF', color: '#0C0B0A' }}
      >
        Revisar agora · 5 min
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    </div>
  )
}
