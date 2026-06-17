import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { answers, professional_area } = await req.json()

    const prompt = `You are an expert English language assessor. Evaluate the following 3 written answers from a learner who works in "${professional_area || 'business'}".

Question 1 (warm-up — self-introduction): "${answers[0]}"
Question 2 (intermediate — challenging situation): "${answers[1]}"
Question 3 (advanced — professional opinion): "${answers[2]}"

Assess the overall CEFR level (A1, A2, B1, B2, C1, or C2) based on: vocabulary range, grammar accuracy, sentence complexity, coherence, and fluency of expression.

IMPORTANT: Write the "explanation", "strong_areas", and "weak_areas" fields IN PORTUGUESE (Brazilian Portuguese). Only the JSON keys and the level value stay in English.

Respond ONLY with a JSON object:
{
  "level": "B1",
  "confidence": "high",
  "explanation": "Frase curta explicando o nível (em português)",
  "strong_areas": ["vocabulário", "coerência"],
  "weak_areas": ["precisão gramatical", "complexidade das frases"]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 200,
    })

    const result = JSON.parse(completion.choices[0].message.content ?? '{}')
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
