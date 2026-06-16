import { Brain, ArrowRight } from 'lucide-react'
import type { VocabReview } from '@/types'

interface Props {
  reviews: VocabReview[]
  totalVocab: number
}

export function VocabReviewCard({ reviews, totalVocab }: Props) {
  if (reviews.length === 0) return null

  return (
    <section className="space-y-3">
      <span
        className="block text-[11px] font-medium uppercase tracking-[0.08em] px-0.5"
        style={{ color: '#999' }}
      >
        Revisão de vocabulário
      </span>

      {/* Gradient spotlight card — coral */}
      <div className="gradient-coral rounded-[30px] p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="text-white font-medium leading-[1.05]"
              style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.05em' }}
            >
              {reviews.length} palavras
            </p>
            <p
              className="text-[14px] mt-1.5"
              style={{ color: 'rgba(255,255,255,0.60)', letterSpacing: '-0.014em' }}
            >
              aguardando revisão hoje · {totalVocab} no total
            </p>
          </div>
          <div
            className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          >
            <Brain className="h-5 w-5 text-white" />
          </div>
        </div>

        {/* Word preview chips */}
        <div className="flex flex-wrap gap-1.5">
          {reviews.slice(0, 5).map(r => (
            <span
              key={r.id}
              className="px-2.5 py-1 rounded-full text-[12px] font-medium"
              style={{ background: 'rgba(255,255,255,0.12)', color: '#FFF' }}
            >
              {r.word}
            </span>
          ))}
          {reviews.length > 5 && (
            <span
              className="px-2.5 py-1 rounded-full text-[12px] font-medium"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.50)' }}
            >
              +{reviews.length - 5}
            </span>
          )}
        </div>

        {/* CTA */}
        <a
          href="/student/vocab-review"
          className="flex items-center justify-center gap-2 w-full py-[10px] rounded-full text-[13px] font-medium tracking-[-0.014em] transition-opacity hover:opacity-90"
          style={{ background: '#FFFFFF', color: '#0C0B0A' }}
        >
          Revisar agora · 5 min
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  )
}
