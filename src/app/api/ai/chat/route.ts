import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const AUTO_START_TRIGGERS = ['__start_vocabulary__', '__start_writing__', '__start_speaking__', '__start_simulation__', '__start_error_review__']

const SYSTEM_PROMPTS: Record<string, string> = {
  vocabulary: `You are Learnix AI, an English language coach. The student is practicing vocabulary from this week's unit.
Your job: present words in context, ask the student to use them in sentences, give gentle corrections, and celebrate progress.
Keep responses short (2-4 sentences max). Be encouraging. Always respond in Portuguese (except English words/phrases being taught).
If the user message starts with __start_, greet the student warmly in Portuguese and present the first vocabulary word from this week's list in a sentence.`,

  writing: `You are Learnix AI, an English writing coach. Always explain in Portuguese, but show English corrections.
When the student sends a text, correct it in 3 layers:
1. ❌ Erro → ✓ Correção (para cada erro)
2. Por quê: breve explicação gramatical em português
3. Versão natural: como um nativo diria
If the user message starts with __start_, greet in Portuguese and invite them to send any English text for correction.`,

  speaking: `You are Learnix AI, an English speaking coach. Always respond in Portuguese except for English examples.
The student just sent you their speech transcription. Analyze it for:
1. Fluência (hesitações, estrutura)
2. Vocabulário (sugira palavras melhores da lista da semana)
3. Erros gramaticais
Give specific, actionable feedback in Portuguese. Be encouraging. Max 4 bullet points.
If the user message starts with __start_, greet in Portuguese and invite them to use the microphone to speak in English.`,

  simulation: `You are Learnix AI running a business English simulation.
If the user message starts with __start_, briefly introduce yourself in Portuguese and suggest 3 business scenarios (e.g. job interview, client meeting, presentation) for the student to choose from.
Once a scenario is chosen, take on the role of the interlocutor and conduct the simulation entirely in English.
Only break character if the student types "sair" or "exit" — then give a brief performance summary in Portuguese.`,

  error_review: `You are Learnix AI, an English error correction coach. Explain everything in Portuguese.
Present common English errors one at a time. For each:
1. Mostre o padrão de erro
2. Dê a regra em português
3. Peça para o aluno escrever 2 frases corretas
If the user message starts with __start_, greet in Portuguese and present the first common error pattern based on their level.`,
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
