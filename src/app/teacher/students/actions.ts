'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createInvite(email?: string, groupId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data, error } = await supabase
    .from('invites')
    .insert({ teacher_id: user.id, email: email || null, group_id: groupId || null })
    .select('token')
    .single()

  if (error) return { error: error.message }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return { url: `${baseUrl}/signup?invite=${data.token}` }
}

export async function createGroup(name: string, language: string, level: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { data, error } = await supabase
    .from('groups')
    .insert({ name, language, level, teacher_id: user.id })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/teacher/students')
  return { group: data }
}

export async function addStudentToGroup(groupId: string, studentId: string) {
  const supabase = await createClient()

  const { error: memberError } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, student_id: studentId })

  if (memberError) return { error: memberError.message }

  // Update student_profile group_id
  await supabase
    .from('student_profiles')
    .update({ group_id: groupId })
    .eq('user_id', studentId)

  revalidatePath('/teacher/students')
  return { ok: true }
}

export async function removeStudentFromGroup(groupId: string, studentId: string) {
  const supabase = await createClient()

  await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('student_id', studentId)

  await supabase
    .from('student_profiles')
    .update({ group_id: null })
    .eq('user_id', studentId)
    .eq('group_id', groupId)

  revalidatePath('/teacher/students')
  return { ok: true }
}

export async function deleteGroup(groupId: string) {
  const supabase = await createClient()

  await supabase.from('group_members').delete().eq('group_id', groupId)
  await supabase.from('groups').delete().eq('id', groupId)

  revalidatePath('/teacher/students')
  return { ok: true }
}
