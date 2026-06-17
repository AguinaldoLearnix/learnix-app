import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/student'

  if (code) {
    // Create a mutable redirect response so we can attach session cookies to it
    const response = NextResponse.redirect(new URL('/login', origin))

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

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('[auth/callback] exchangeCodeForSession error:', error.message)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, origin))
    }
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from('users').select('role, created_at').eq('id', user!.id).single()
      const role = profile?.role

      // Brand-new Google signup (created within last 30s) → show role picker
      const isNewUser = profile?.created_at &&
        (Date.now() - new Date(profile.created_at).getTime()) < 30_000
      if (isNewUser) {
        response.headers.set('Location', `${origin}/onboarding/role`)
        return response
      }

      let dest: string
      if (next !== '/student') {
        dest = next
      } else if (role === 'admin') {
        dest = '/admin'
      } else if (role === 'teacher') {
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles').select('user_id').eq('user_id', user!.id).single()
        dest = teacherProfile ? '/teacher' : '/onboarding/teacher'
      } else {
        const { count } = await supabase
          .from('programs').select('*', { count: 'exact', head: true })
          .eq('student_id', user!.id).eq('status', 'active')
        dest = (count ?? 0) > 0 ? '/student' : '/onboarding'
      }

      response.headers.set('Location', `${origin}${dest}`)
      return response
    }
  }

  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', origin))
}
