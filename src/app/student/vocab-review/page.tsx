import { getVocabReviews } from '@/lib/queries/student'
import { VocabReviewSession } from '@/components/student/VocabReviewSession'

export default async function VocabReviewPage() {
  const reviews = await getVocabReviews()
  return <VocabReviewSession reviews={reviews} />
}
