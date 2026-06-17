import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  const response = NextResponse.json({ ok: false })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return NextResponse.json({ error: error.message })

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('users').select('role').eq('id', user!.id).single()
  const role = profile?.role ?? 'student'

  let redirectTo: string
  if (role === 'admin') {
    redirectTo = '/admin'
  } else if (role === 'teacher') {
    const { data: teacherProfile } = await supabase
      .from('teacher_profiles').select('user_id').eq('user_id', user!.id).single()
    redirectTo = teacherProfile ? '/teacher' : '/onboarding/teacher'
  } else {
    const { count } = await supabase
      .from('programs').select('*', { count: 'exact', head: true })
      .eq('student_id', user!.id).eq('status', 'active')
    redirectTo = (count ?? 0) > 0 ? '/student' : '/onboarding'
  }

  // Copy cookies to a fresh JSON response
  const res = NextResponse.json({ redirectTo })
  response.cookies.getAll().forEach(c => res.cookies.set(c.name, c.value))
  return res
}
