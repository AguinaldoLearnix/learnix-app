import { getTeacherStudents, getTeacherGroups } from '@/lib/queries/teacher'
import { StudentsUI } from '@/components/teacher/StudentsUI'

export default async function TeacherStudentsPage() {
  const [students, groups] = await Promise.all([
    getTeacherStudents(),
    getTeacherGroups(),
  ])

  return <StudentsUI students={students} groups={groups} />
}
