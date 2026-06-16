export type Role = 'student' | 'group_student' | 'teacher' | 'admin'
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type Language = 'english' | 'spanish'
export type TaskType = 'audio' | 'text' | 'quiz' | 'reading'
export type TaskStatus = 'pending' | 'submitted' | 'late' | 'skipped'
export type UnitStatus = 'upcoming' | 'active' | 'completed'
export type LessonStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface User {
  id: string
  email: string
  role: Role
  full_name: string
  avatar_url?: string
}

export interface StudentProfile {
  id: string
  user_id: string
  teacher_id?: string
  language: Language
  current_level: CEFRLevel
  target_level: CEFRLevel
  professional_area: string
  goal: string
  weekly_frequency: number
  study_time_daily: number
  plan_type: 'light' | 'standard' | 'intensive' | 'turbo'
  subscription_status: 'trial' | 'active' | 'paused' | 'cancelled'
}

export interface WeeklyUnit {
  id: string
  program_id: string
  week_number: number
  theme: string
  vocabulary: string[]
  expressions: string[]
  grammar_focus: string
  grammar_explanation: string
  can_do_statements: string[]
  pre_lesson_text: string
  pre_lesson_audio_url?: string
  pre_lesson_video_url?: string
  pre_lesson_questions: string[]
  pre_lesson_task: string
  lesson_objectives: string[]
  post_lesson_task: {
    type: TaskType
    instruction: string
    due_days: number
  }
  available_from: string
  status: UnitStatus
}

export interface Lesson {
  id: string
  student_id?: string
  group_id?: string
  teacher_id: string
  unit_id: string
  scheduled_at: string
  duration_min: number
  meet_url?: string
  status: LessonStatus
  teacher?: { full_name: string; avatar_url?: string }
}

export interface Task {
  id: string
  lesson_id?: string
  unit_id: string
  student_id: string
  type: TaskType
  instruction: string
  due_at: string
  status: TaskStatus
  submission?: TaskSubmission
}

export interface TaskSubmission {
  id: string
  task_id: string
  content_text?: string
  media_url?: string
  transcription?: string
  ai_feedback?: string
  teacher_feedback?: string
  submitted_at: string
}

export interface ErrorBankEntry {
  id: string
  student_id: string
  category: 'grammar' | 'vocabulary' | 'pronunciation' | 'fluency' | 'writing' | 'structure'
  description: string
  example?: string
  correction?: string
  occurrences: number
  status: 'active' | 'improving' | 'resolved'
  source: 'teacher' | 'ai'
}

export interface VocabReview {
  id: string
  word: string
  translation?: string
  context_sentence?: string
  due_at: string
}

export interface StudentDashboard {
  currentUnit: WeeklyUnit | null
  upcomingLesson: Lesson | null
  pendingTasks: Task[]
  engagementScore: number
  vocabularyTotal: number
  streak: number
  pendingVocabReviews: VocabReview[]
  programProgress: { currentWeek: number; totalWeeks: number }
}

// ─── Teacher types ────────────────────────────────────────────────

export type StudentStatus = 'on_track' | 'at_risk' | 'inactive'
export type LessonPerformance = 'excellent' | 'good' | 'needs_work'

export interface TeacherStudent {
  id: string
  full_name: string
  avatar_url?: string
  language: Language
  current_level: CEFRLevel
  target_level: CEFRLevel
  professional_area: string
  plan_type: 'light' | 'standard' | 'intensive' | 'turbo'
  engagement_score: number
  streak: number
  vocabulary_total: number
  status: StudentStatus
  current_week: number
  total_weeks: number
  current_theme: string
  pre_lesson_done: boolean
  task_pending: boolean
  last_lesson_at?: string
  next_lesson_at?: string
  next_lesson_id?: string
  ai_sessions_week: number
  errors_active: number
  scores: { speaking: number; listening: number; reading: number; writing: number; uol: number }
}

export interface TeacherLesson {
  id: string
  student: { id: string; full_name: string; current_level: CEFRLevel }
  unit: { week_number: number; theme: string; grammar_focus: string; vocabulary: string[] }
  scheduled_at: string
  duration_min: number
  meet_url?: string
  status: LessonStatus
  pre_lesson_status: {
    vocabulary_viewed: boolean
    text_viewed: boolean
    audio_viewed: boolean
    task_done: boolean
  }
  ai_sessions_week: number
  errors_active: number
  last_lesson_note?: string
  report_pending: boolean
}

export interface LessonReport {
  lesson_id: string
  performance: LessonPerformance
  errors_logged: Array<{
    category: ErrorBankEntry['category']
    description: string
    example: string
    correction: string
  }>
  vocabulary_covered: string[]
  feedback_summary: string
  next_lesson_note: string
  task_type: TaskType
  task_instruction: string
  task_due_days: number
}
