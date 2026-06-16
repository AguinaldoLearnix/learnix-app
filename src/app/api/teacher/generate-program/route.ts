import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { language, start_level, target_level, goal, professional_area, total_weeks } = await req.json()

    const prompt = `You are a professional language curriculum designer.

Create a ${total_weeks}-week ${language} course for a student with these details:
- Current level: ${start_level}
- Target level: ${target_level}
- Goal: ${goal}
- Professional area: ${professional_area}

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "units": [
    {
      "week_number": 1,
      "theme": "string (engaging, real-world topic relevant to their professional area)",
      "grammar_focus": "string (specific grammar point for this week)",
      "vocabulary": ["word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8"],
      "expressions": ["expression 1", "expression 2", "expression 3"],
      "can_do_statements": ["I can...", "I can..."],
      "lesson_objectives": ["objective 1", "objective 2"]
    }
  ]
}

Generate all ${total_weeks} weeks. Progress logically from ${start_level} to ${target_level}.
Themes should be practical, professional, and relevant to ${professional_area}.
Vocabulary must be real, useful words (8 per week, no duplicates across weeks).`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: total_weeks * 200,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(content)

    return NextResponse.json(parsed)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
