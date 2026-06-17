import { createClient } from '@/lib/supabase/server'
import { PracticeClient } from './PracticeClient'

export default async function PracticePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let context: Record<string, any> = {}
  if (user) {
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('current_level, target_level')
      .eq('user_id', user.id)
      .single()

    const { data: program } = await supabase
      .from('programs')
      .select('id')
      .eq('student_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (program) {
      const { data: unit } = await supabase
        .from('weekly_units')
        .select('theme, grammar_focus, vocabulary')
        .eq('program_id', program.id)
        .eq('status', 'active')
        .order('week_number', { ascending: false })
        .limit(1)
        .single()

      context = {
        theme: unit?.theme,
        grammar_focus: unit?.grammar_focus,
        vocabulary: unit?.vocabulary ?? [],
        current_level: profile?.current_level ?? 'B1',
        target_level: profile?.target_level ?? 'B2',
      }
    } else {
      context = {
        current_level: profile?.current_level ?? 'B1',
        target_level: profile?.target_level ?? 'B2',
      }
    }
  }

  return <PracticeClient context={context} />
}
