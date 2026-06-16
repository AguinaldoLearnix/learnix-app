import { getAdminUsers } from '@/lib/queries/admin'
import { UsersUI } from '@/components/admin/UsersUI'

export default async function UsersPage() {
  const users = await getAdminUsers()
  return <UsersUI users={users} />
}
