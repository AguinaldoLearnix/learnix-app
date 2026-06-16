import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { level, target_level, goal, professional_area, interests, weekly_frequency, deadline_months } = await req.json()

    const total_weeks = Math.max(8, Math.min(52, deadline_months * 4))

    const prompt = `You are a professional English curriculum designer. Create a personalized ${total_weeks}-week English program.

Student profile:
- Current level: ${level}
- Target level: ${target_level}
- Main goal: ${goal}
- Professional area: ${professional_area}
- Interests: ${interests}
- Study frequency: ${weekly_frequency} sessions/week

Generate ${total_weeks} weekly units. Each unit must be highly relevant to their job and interests.

Respond ONLY with this JSON:
{
  "title": "Program title (max 60 chars)",
  "description": "2-sentence description of the program",
  "units": [
    {
      "week_number": 1,
      "theme": "Theme title",
      "grammar_focus": "Grammar topic",
      "vocabulary": ["word1", "word2", "word3", "word4", "word5"],
      "can_do_statements": ["I can...", "I can..."],
      "pre_lesson_text": "3-sentence reading passage on the theme",
      "pre_lesson_questions": ["Question 1?", "Question 2?"]
    }
  ]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: total_weeks * 250,
    })

    const result = JSON.parse(completion.choices[0].message.content ?? '{}')
    return NextResponse.json({ ...result, total_weeks })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
