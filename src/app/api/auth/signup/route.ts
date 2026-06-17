import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password, full_name, role, language, current_level, goal, invite_token } = body

  const pending: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            pending.push({ name, value, options: options as Record<string, unknown> })
          })
        },
      },
    }
  )

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name, role: role ?? 'student', language, current_level, goal } },
  })

  if (error) return NextResponse.json({ error: error.message })
  if (!authData.session) return NextResponse.json({ confirm: true })

  // Consume invite token
  if (invite_token && authData.user) {
    const { data: invite } = await supabase
      .from('invites').select('teacher_id, group_id')
      .eq('token', invite_token).is('used_at', null)
      .gte('expires_at', new Date().toISOString()).single()
    if (invite) {
      await supabase.from('student_profiles')
        .update({ teacher_id: invite.teacher_id, group_id: invite.group_id ?? null })
        .eq('user_id', authData.user.id)
      if (invite.group_id)
        await supabase.from('group_members').insert({ group_id: invite.group_id, student_id: authData.user.id })
      await supabase.from('invites').update({ used_at: new Date().toISOString() }).eq('token', invite_token)
    }
  }

  const redirectTo = role === 'teacher' ? '/onboarding/teacher' : '/onboarding'
  const res = NextResponse.json({ redirectTo })
  pending.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
  return res
}
