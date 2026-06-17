import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Public routes — accessible without auth
  const publicRoutes = ['/login', '/signup', '/reset-password', '/api/auth', '/auth/callback']
  const onboardingRoutes = ['/onboarding', '/onboarding/role']
  const isPublic = publicRoutes.some(r => pathname.startsWith(r))
  const isOnboarding = onboardingRoutes.some(r => pathname.startsWith(r))

  // Redirect unauthenticated users to login
  if (!user && !isPublic && !isOnboarding) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages based on role
  if (user && isPublic) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    const role = profile?.role ?? 'student'
    const url = request.nextUrl.clone()
    url.pathname = role === 'admin' ? '/admin' : role === 'teacher' ? '/teacher' : '/student'
    return NextResponse.redirect(url)
  }

  // Redirect student to onboarding if no program exists
  if (user && pathname.startsWith('/student') && !isOnboarding) {
    const { count } = await supabase
      .from('programs')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('status', 'active')
    if ((count ?? 0) === 0) {
      const url = request.nextUrl.clone()
      url.pathname = '/onboarding'
      return NextResponse.redirect(url)
    }
  }

  // Redirect teacher to onboarding if no profile exists
  if (user && pathname.startsWith('/teacher') && !isOnboarding) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (profile?.role === 'teacher') {
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles').select('user_id').eq('user_id', user.id).single()
      if (!teacherProfile) {
        const url = request.nextUrl.clone()
        url.pathname = '/onboarding/teacher'
        return NextResponse.redirect(url)
      }
    }
  }

  // Protect role-specific routes
  if (user && (pathname.startsWith('/admin') || pathname.startsWith('/teacher'))) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    const role = profile?.role ?? 'student'
    if (pathname.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = role === 'teacher' ? '/teacher' : '/student'
      return NextResponse.redirect(url)
    }
    if (pathname.startsWith('/teacher') && role !== 'teacher' && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/student'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
