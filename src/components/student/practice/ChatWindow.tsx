'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Mic, Square, GraduationCap, Volume2, VolumeX, Loader2 } from 'lucide-react'
import type { PracticeMode } from './ModeSelector'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isAudio?: boolean
}

interface Context {
  theme?: string
  grammar_focus?: string
  vocabulary?: string[]
  current_level?: string
  target_level?: string
}

interface Props {
  mode: PracticeMode
  initialMessages?: Message[]
  context?: Context
}

const modeIntro: Record<PracticeMode, string> = {
  vocabulary:   'Modo Vocabulário — Vou trabalhar as palavras desta semana com você.',
  writing:      'Modo Escrita — Envie um texto e vou corrigir em 3 camadas: erro → por quê → versão natural.',
  speaking:     'Modo Speaking — Grave seu áudio e receba feedback detalhado sobre fluência e vocabulário.',
  simulation:   'Modo Simulação — Escolha um cenário e vou assumir o papel do interlocutor. Digite "sair" para encerrar.',
  error_review: 'Modo Revisão de Erros — Vamos trabalhar seus erros mais recorrentes com exercícios de fixação.',
}

type RecordingState = 'idle' | 'recording' | 'processing'
type SpeakingState = 'idle' | 'loading' | 'playing'

export function ChatWindow({ mode, initialMessages = [], context }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [speakingState, setSpeakingState] = useState<SpeakingState>('idle')
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [recordSeconds, setRecordSeconds] = useState(0)

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Stop any playing audio when mode changes and auto-start conversation
  useEffect(() => {
    audioRef.current?.pause()
    setSpeakingState('idle')
    setMessages([])
    // Auto-initiate: send a hidden "start" trigger so AI opens the session
    const timer = setTimeout(() => {
      autoStart(mode)
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const autoStart = useCallback(async (currentMode: PracticeMode) => {
    setLoading(true)
    const starterMsg = currentMode === 'vocabulary'
      ? '__start_vocabulary__'
      : currentMode === 'writing'
      ? '__start_writing__'
      : currentMode === 'speaking'
      ? '__start_speaking__'
      : currentMode === 'simulation'
      ? '__start_simulation__'
      : '__start_error_review__'
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: starterMsg }],
          mode: currentMode,
          context,
        }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages([{ role: 'assistant', content: data.reply }])
        speakText(data.reply)
      }
    } catch {
      // silently fail — user can still type manually
    } finally {
      setLoading(false)
    }
  }, [context, speakText])

  const speakText = useCallback(async (text: string) => {
    if (!autoSpeak) return
    // Strip markdown for TTS
    const clean = text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/[❌✓📌→]/g, '')
    setSpeakingState('loading')
    try {
      const res = await fetch('/api/ai/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
      })
      if (!res.ok) throw new Error('TTS failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      setSpeakingState('playing')
      audio.play()
      audio.onended = () => {
        setSpeakingState('idle')
        URL.revokeObjectURL(url)
      }
    } catch {
      setSpeakingState('idle')
    }
  }, [autoSpeak])

  const sendMessage = useCallback(async (userText: string, isAudio = false) => {
    if (!userText.trim() || loading) return
    const userMsg: Message = { role: 'user', content: userText, isAudio }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = [...messages, userMsg].slice(-12).map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, mode, context }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      const reply = data.reply as string
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      speakText(reply)
      // Persist session to DB (fire-and-forget)
      fetch('/api/ai/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, unit_id: null }),
      }).catch(() => {})
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Erro: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }, [messages, mode, context, loading, speakText])

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []
      recorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        setRecordingState('processing')
        await transcribeAudio()
      }
      recorder.start(250)
      mediaRecorderRef.current = recorder
      setRecordingState('recording')
      setRecordSeconds(0)
      timerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000)
    } catch {
      alert('Permissão de microfone negada.')
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRecorderRef.current?.stop()
  }

  async function transcribeAudio() {
    const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
    const fd = new FormData()
    fd.append('audio', blob, 'recording.webm')
    try {
      const res = await fetch('/api/ai/transcribe', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      await sendMessage(data.text, true)
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Erro na transcrição: ${err.message}` }])
    } finally {
      setRecordingState('idle')
    }
  }

  function stopSpeaking() {
    audioRef.current?.pause()
    setSpeakingState('idle')
  }

  const showMic = mode === 'speaking' || mode === 'simulation'
  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Mode intro */}
        <div className="flex items-start gap-3 text-[12px] px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#666' }}>
          <GraduationCap className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          {modeIntro[mode]}
        </div>

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.08)' }}>
                <GraduationCap className="h-3.5 w-3.5" style={{ color: '#A78BFA' }} />
              </div>
            )}
            <div className="max-w-[80%] space-y-1">
              {msg.isAudio && (
                <div className="flex items-center gap-1 text-[10px]" style={{ color: '#555' }}>
                  <Mic className="h-3 w-3" /> <span>Áudio transcrito</span>
                </div>
              )}
              <div
                className="rounded-[16px] px-4 py-3 text-[13px] leading-relaxed"
                style={{
                  background: msg.role === 'user' ? '#FFFFFF' : '#1A1917',
                  color: msg.role === 'user' ? '#0C0B0A' : '#CCC',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  letterSpacing: '-0.013em',
                  whiteSpace: 'pre-line',
                }}
              >
                {renderMarkdown(msg.content)}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.08)' }}>
              <GraduationCap className="h-3.5 w-3.5" style={{ color: '#A78BFA' }} />
            </div>
            <div className="rounded-[16px] px-4 py-3" style={{ background: '#1A1917' }}>
              <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#A78BFA' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Recording overlay */}
      {recordingState === 'recording' && (
        <div className="mx-4 mb-2 flex items-center gap-3 px-4 py-3 rounded-[14px]"
          style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#EF4444' }} />
          <span className="text-[12px] font-medium" style={{ color: '#F87171' }}>Gravando… {fmt(recordSeconds)}</span>
          <span className="flex-1 text-[11px]" style={{ color: '#666' }}>Fale em inglês — clique Stop quando terminar</span>
          <button onClick={stopRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
            style={{ background: '#EF4444', color: '#FFF' }}>
            <Square className="h-3 w-3" /> Stop
          </button>
        </div>
      )}

      {recordingState === 'processing' && (
        <div className="mx-4 mb-2 flex items-center gap-2 px-4 py-3 rounded-[14px]"
          style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)' }}>
          <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: '#A78BFA' }} />
          <span className="text-[12px]" style={{ color: '#A78BFA' }}>Transcrevendo áudio com Whisper…</span>
        </div>
      )}

      {/* Input area */}
      <div className="border-t px-4 py-3" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-end gap-2 rounded-[16px] p-2" style={{ background: '#1A1917' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading || recordingState !== 'idle'}
            placeholder={showMic ? 'Escreva ou use o microfone →' : 'Escreva sua resposta...'}
            rows={1}
            className="flex-1 resize-none bg-transparent outline-none text-[13px] text-white placeholder:text-[#444] py-1 px-2 disabled:opacity-40"
            style={{ letterSpacing: '-0.013em', lineHeight: 1.5, maxHeight: 120 }}
            onInput={e => {
              const el = e.currentTarget
              el.style.height = 'auto'
              el.style.height = Math.min(el.scrollHeight, 120) + 'px'
            }}
          />

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Auto-speak toggle */}
            <button onClick={() => { if (speakingState === 'playing') stopSpeaking(); setAutoSpeak(v => !v) }}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              title={autoSpeak ? 'Desativar voz' : 'Ativar voz'}
              style={{ background: autoSpeak ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.05)', color: autoSpeak ? '#A78BFA' : '#444' }}>
              {speakingState === 'loading'
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : speakingState === 'playing'
                  ? <VolumeX className="h-3.5 w-3.5" />
                  : <Volume2 className="h-3.5 w-3.5" />}
            </button>

            {/* Mic button */}
            {showMic && recordingState === 'idle' && (
              <button onClick={startRecording} disabled={loading}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'rgba(74,222,128,0.12)', color: '#4ADE80' }}>
                <Mic className="h-4 w-4" />
              </button>
            )}

            {/* Send button */}
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading || recordingState !== 'idle'}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity disabled:opacity-30"
              style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px]" style={{ color: '#444' }}>Enter para enviar · Shift+Enter para nova linha</p>
          {speakingState === 'playing' && (
            <button onClick={stopSpeaking} className="text-[11px] flex items-center gap-1" style={{ color: '#A78BFA' }}>
              <Square className="h-2.5 w-2.5" /> Parar voz
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: '#FFF', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} style={{ color: '#999' }}>{part.slice(1, -1)}</em>
    return <span key={i}>{part}</span>
  })
}
