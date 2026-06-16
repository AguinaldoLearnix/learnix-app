import { getErrorBank } from '@/lib/queries/student'
import { ErrorsUI } from '@/components/student/errors/ErrorsUI'

export default async function ErrorsPage() {
  const errors = await getErrorBank()
  return <ErrorsUI errors={errors} />
}
