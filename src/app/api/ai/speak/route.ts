import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text) return NextResponse.json({ error: 'No text' }, { status: 400 })

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1-hd',
      voice: 'nova',   // natural, friendly female voice
      input: text,
      speed: 0.95,
    })

    const buffer = Buffer.from(await mp3.arrayBuffer())
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
