'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: error.message }

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('role').eq('id', user!.id).single()
  const role = profile?.role ?? 'student'

  if (role === 'teacher') {
    const { data: teacherProfile } = await supabase
      .from('teacher_profiles').select('user_id').eq('user_id', user!.id).single()
    redirect(teacherProfile ? '/teacher' : '/onboarding/teacher')
  }

  redirect(role === 'admin' ? '/admin' : '/student')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const inviteToken = formData.get('invite_token') as string | null

  const role = (formData.get('role') as string) || 'student'

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: formData.get('full_name') as string,
        role,
        language: formData.get('language') as string,
        current_level: formData.get('current_level') as string,
        goal: formData.get('goal') as string,
      },
    },
  })

  if (error) return { error: error.message }

  // Email confirmation pending — no active session yet
  if (!authData.session) {
    return { confirm: true }
  }

  // Consume invite token — assign teacher + optional group
  if (inviteToken && authData.user) {
    const { data: invite } = await supabase
      .from('invites')
      .select('teacher_id, group_id')
      .eq('token', inviteToken)
      .is('used_at', null)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (invite) {
      await supabase
        .from('student_profiles')
        .update({
          teacher_id: invite.teacher_id,
          group_id: invite.group_id ?? null,
        })
        .eq('user_id', authData.user.id)

      if (invite.group_id) {
        await supabase
          .from('group_members')
          .insert({ group_id: invite.group_id, student_id: authData.user.id })
      }

      await supabase
        .from('invites')
        .update({ used_at: new Date().toISOString() })
        .eq('token', inviteToken)
    }
  }

  redirect(role === 'teacher' ? '/onboarding/teacher' : '/onboarding')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function signInWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) return { error: error.message }
  // Return the URL — client must do window.location.href to avoid Next.js soft-navigation
  return { url: data.url }
}
