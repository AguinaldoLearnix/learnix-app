import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/student'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: profile } = await supabase.from('users').select('role').eq('id', user!.id).single()
      const role = profile?.role

      // Brand-new Google user — no role set yet, pick role first
      if (!role) {
        return NextResponse.redirect(`${origin}/onboarding/role`)
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
      return NextResponse.redirect(`${origin}${dest}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
