import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPTS: Record<string, string> = {
  vocabulary: `You are Learnix AI, an English language coach. The student is practicing vocabulary from this week's unit.
Your job: present words in context, ask the student to use them in sentences, give gentle corrections, and celebrate progress.
Keep responses short (2-4 sentences max). Be encouraging. Always respond in the same language the student uses, but teach in English.`,

  writing: `You are Learnix AI, an English writing coach.
When the student sends a text, correct it in 3 layers:
1. ❌ Error → ✓ Correction (for each mistake)
2. Why: brief grammar/vocabulary explanation
3. Natural version: how a native speaker would say it
Keep a warm, professional tone. Respond in the same language the student uses.`,

  speaking: `You are Learnix AI, an English speaking coach.
The student just sent you their speech transcription. Analyze it for:
1. Fluency issues (fillers, hesitations, structure)
2. Vocabulary (suggest better word choices from the week's list when relevant)
3. Grammar errors
Give specific, actionable feedback. Be encouraging. Keep it concise (3-5 bullet points max).`,

  simulation: `You are Learnix AI running a business English simulation.
Take on the role of the interlocutor in the scenario the student sets up.
Stay in character throughout. Only break character if the student types "sair" or "exit" — then give a brief performance summary.
Use natural, professional business English.`,

  error_review: `You are Learnix AI, an English error correction coach.
Present the student's recurring errors one at a time. For each error:
1. Show the mistake pattern
2. Give a quick rule/explanation
3. Ask them to write 2 correct sentences using the pattern
Track their progress and celebrate improvements.`,
}

export async function POST(req: NextRequest) {
  try {
    const { messages, mode, context } = await req.json()

    const systemPrompt = SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS.vocabulary

    const contextBlock = context ? `
\n\n--- Student Context ---
Week theme: ${context.theme}
Grammar focus: ${context.grammar_focus}
Vocabulary this week: ${(context.vocabulary ?? []).slice(0, 12).join(', ')}
Student level: ${context.current_level}
Target level: ${context.target_level}
` : ''

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt + contextBlock },
        ...messages,
      ],
      max_tokens: 400,
      temperature: 0.7,
    })

    const reply = response.choices[0]?.message?.content ?? ''
    return NextResponse.json({ reply })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
