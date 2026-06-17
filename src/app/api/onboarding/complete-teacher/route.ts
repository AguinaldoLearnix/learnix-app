import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { languages, specialties, bio, rate_per_hour, max_students } = body

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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' })

  const { error } = await supabase.from('teacher_profiles').upsert({
    user_id: user.id,
    languages,
    specialties,
    bio,
    rate_per_lesson: rate_per_hour,
    max_students,
  }, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message })

  const res = NextResponse.json({ redirectTo: '/teacher' })
  pending.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
  return res
}
