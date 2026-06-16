'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mic, Square, FileText, Send, Loader2, Check, Bot, Clock, AlertTriangle } from 'lucide-react'
import { submitTask } from '@/app/student/actions'

const TYPE_LABEL: Record<string, string> = {
  audio: 'Áudio', text: 'Texto', quiz: 'Quiz', reading: 'Leitura',
}

export function TaskSubmitUI({ task }: { task: any }) {
  const [textInput, setTextInput]       = useState('')
  const [recordingState, setRecording]  = useState<'idle' | 'recording' | 'processing'>('idle')
  const [transcription, setTranscription] = useState('')
  const [aiFeedback, setAiFeedback]     = useState('')
  const [loadingFeedback, setLoadingFeedback] = useState(false)
  const [saving, setSaving]             = useState(false)
  const [done, setDone]                 = useState(false)
  const [error, setError]               = useState('')
  const [recordSeconds, setRecordSeconds] = useState(0)

  const recorderRef  = useRef<MediaRecorder | null>(null)
  const chunksRef    = useRef<Blob[]>([])
  const timerRef     = useRef<ReturnType<typeof setInterval> | null>(null)

  const alreadySubmitted = !!task.submission
  const isAudio = task.type === 'audio'
  const isLate  = task.status === 'late'

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mime   = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
      const rec    = new MediaRecorder(stream, { mimeType: mime })
      chunksRef.current = []
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        setRecording('processing')
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const fd   = new FormData()
        fd.append('audio', blob, 'task.webm')
        try {
          const res  = await fetch('/api/ai/transcribe', { method: 'POST', body: fd })
          const data = await res.json()
          if (data.error) throw new Error(data.error)
          setTranscription(data.text)
          await getFeedback(data.text)
        } catch (e: any) {
          setError(e.message)
        } finally {
          setRecording('idle')
        }
      }
      rec.start(250)
      recorderRef.current = rec
      setRecording('recording')
      setRecordSeconds(0)
      timerRef.current = setInterval(() => setRecordSeconds(s => s + 1), 1000)
    } catch {
      setError('Permissão de microfone negada.')
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    recorderRef.current?.stop()
  }

  async function getFeedback(content: string) {
    setLoadingFeedback(true)
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content }],
          mode: isAudio ? 'speaking' : 'writing',
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setAiFeedback(data.reply)
    } catch (e: any) {
      setAiFeedback('')
    } finally {
      setLoadingFeedback(false)
    }
  }

  async function handleSubmit() {
    const content = isAudio ? transcription : textInput
    if (!content.trim()) { setError('Adicione conteúdo antes de enviar.'); return }
    setSaving(true)
    setError('')
    const result = await submitTask(task.id, {
      contentText: isAudio ? undefined : textInput,
      transcription: isAudio ? transcription : undefined,
      aiFeedback: aiFeedback || undefined,
    })
    if (result.error) { setError(result.error); setSaving(false) }
    else setDone(true)
  }

  if (done || alreadySubmitted) {
    const sub = task.submission
    return (
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="flex items-center px-8 border-b shrink-0" style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
          <Link href="/student" className="flex items-center gap-1.5 text-[12px] hover:opacity-70" style={{ color: '#555' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Voltar
          </Link>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 gap-4 p-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)' }}>
            <Check className="h-7 w-7" style={{ color: '#4ADE80' }} />
          </div>
          <h2 className="text-[20px] font-medium text-white" style={{ letterSpacing: '-0.03em' }}>Tarefa entregue!</h2>
          {sub?.ai_feedback && (
            <div className="max-w-xl w-full rounded-[20px] p-5 space-y-2" style={{ background: '#1A1917' }}>
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-4 w-4" style={{ color: '#A78BFA' }} />
                <span className="text-[12px] font-medium" style={{ color: '#A78BFA' }}>Feedback da IA</span>
              </div>
              <p className="text-[13px] leading-relaxed" style={{ color: '#CCC', whiteSpace: 'pre-line' }}>{sub.ai_feedback}</p>
            </div>
          )}
          <Link href="/student" className="mt-2 px-5 py-2.5 rounded-full text-[13px] font-medium"
            style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 border-b shrink-0"
        style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3">
          <Link href="/student" className="flex items-center gap-1.5 text-[12px] hover:opacity-70" style={{ color: '#555' }}>
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <span style={{ color: '#333' }}>/</span>
          <span className="text-[13px] font-medium text-white">Tarefa · {TYPE_LABEL[task.type] ?? task.type}</span>
        </div>
        {isLate && (
          <span className="flex items-center gap-1.5 text-[12px]" style={{ color: '#F87171' }}>
            <AlertTriangle className="h-3.5 w-3.5" /> Atrasada
          </span>
        )}
      </div>

      <div className="p-6 max-w-2xl mx-auto w-full space-y-5">
        {/* Task card */}
        <div className="rounded-[20px] p-5 space-y-2" style={{ background: '#1A1917' }}>
          <div className="flex items-center gap-2">
            {isAudio
              ? <Mic className="h-4 w-4" style={{ color: '#4ADE80' }} />
              : <FileText className="h-4 w-4" style={{ color: '#60A5FA' }} />}
            <span className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>
              Tarefa {TYPE_LABEL[task.type]}
            </span>
          </div>
          <p className="text-[15px] font-medium text-white" style={{ letterSpacing: '-0.02em' }}>
            {task.instruction}
          </p>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#555' }}>
            <Clock className="h-3 w-3" />
            {new Date(task.due_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
          </div>
        </div>

        {/* Input area */}
        {isAudio ? (
          <div className="space-y-4">
            {/* Recording controls */}
            {recordingState === 'idle' && !transcription && (
              <div className="rounded-[20px] p-8 flex flex-col items-center gap-4" style={{ background: '#1A1917' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)' }}>
                  <Mic className="h-7 w-7" style={{ color: '#4ADE80' }} />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-medium text-white">Grave seu áudio</p>
                  <p className="text-[12px] mt-1" style={{ color: '#555' }}>Fale em inglês por pelo menos 30 segundos</p>
                </div>
                <button onClick={startRecording}
                  className="px-6 py-2.5 rounded-full text-[13px] font-medium"
                  style={{ background: '#4ADE80', color: '#000' }}>
                  Iniciar gravação
                </button>
              </div>
            )}

            {recordingState === 'recording' && (
              <div className="rounded-[20px] p-8 flex flex-col items-center gap-4" style={{ background: '#1A1917' }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <div className="w-5 h-5 rounded-full" style={{ background: '#EF4444' }} />
                </div>
                <p className="text-[20px] font-medium tabular-nums text-white" style={{ letterSpacing: '-0.03em' }}>
                  {fmt(recordSeconds)}
                </p>
                <button onClick={stopRecording}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-medium"
                  style={{ background: '#EF4444', color: '#FFF' }}>
                  <Square className="h-3.5 w-3.5" /> Parar gravação
                </button>
              </div>
            )}

            {recordingState === 'processing' && (
              <div className="rounded-[20px] p-8 flex flex-col items-center gap-3" style={{ background: '#1A1917' }}>
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#A78BFA' }} />
                <p className="text-[13px] text-white">Transcrevendo com Whisper…</p>
              </div>
            )}

            {transcription && (
              <div className="rounded-[20px] p-5 space-y-2" style={{ background: '#1A1917' }}>
                <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Transcrição</p>
                <p className="text-[13px] leading-relaxed" style={{ color: '#CCC' }}>{transcription}</p>
                <button onClick={() => { setTranscription(''); setAiFeedback('') }}
                  className="text-[11px] mt-2" style={{ color: '#555' }}>
                  Regravar
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Sua resposta</p>
            <textarea value={textInput} onChange={e => setTextInput(e.target.value)} rows={8}
              placeholder="Escreva sua resposta aqui…"
              className="w-full px-4 py-3 rounded-[16px] text-[13px] text-white outline-none resize-none leading-relaxed"
              style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.06)', letterSpacing: '-0.012em' }} />
            {textInput.trim() && !aiFeedback && (
              <button onClick={() => getFeedback(textInput)} disabled={loadingFeedback}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-medium disabled:opacity-50"
                style={{ background: 'rgba(167,139,250,0.12)', color: '#A78BFA' }}>
                {loadingFeedback ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5" />}
                Obter feedback da IA
              </button>
            )}
          </div>
        )}

        {/* AI Feedback */}
        {loadingFeedback && (
          <div className="rounded-[20px] p-5 flex items-center gap-3" style={{ background: '#1A1917' }}>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" style={{ color: '#A78BFA' }} />
            <p className="text-[13px]" style={{ color: '#666' }}>GPT-4o analisando sua resposta…</p>
          </div>
        )}

        {aiFeedback && (
          <div className="rounded-[20px] p-5 space-y-3" style={{ background: '#1A1917', border: '1px solid rgba(167,139,250,0.15)' }}>
            <div className="flex items-center gap-2">
              <Bot className="h-3.5 w-3.5" style={{ color: '#A78BFA' }} />
              <span className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#A78BFA' }}>Feedback IA</span>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: '#CCC', whiteSpace: 'pre-line' }}>{aiFeedback}</p>
          </div>
        )}

        {error && <p className="text-[12px]" style={{ color: '#F87171' }}>{error}</p>}

        {/* Submit button */}
        {(transcription || textInput.trim()) && (
          <button onClick={handleSubmit} disabled={saving}
            className="w-full py-3.5 rounded-full text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Entregar tarefa
          </button>
        )}
      </div>
    </div>
  )
}
