'use client'

import { useState, useRef } from 'react'
import { Mic, FileText, Play, Download, TrendingUp, Plus, X, Square, Loader2, Check } from 'lucide-react'
import { addPortfolioItem } from '@/app/student/actions'

const TYPE_LABELS: Record<string, string> = {
  before_audio: 'Áudio inicial',
  after_audio: 'Áudio atual',
  audio: 'Áudio',
  text: 'Texto',
  presentation: 'Apresentação',
}
const TYPE_FILTERS = ['all', 'audio', 'text'] as const

type PortfolioItem = {
  id: string
  type: string
  title?: string
  media_url?: string
  transcription?: string
  score?: number | null
  unit_id?: string
  theme?: string
  duration?: string
  created_at: string
}

function ScoreRing({ score }: { score: number | null | undefined }) {
  if (score == null) return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-[10px]" style={{ background: 'rgba(255,255,255,0.05)', color: '#555' }}>—</div>
  )
  const color = score >= 80 ? '#4ADE80' : score >= 65 ? '#FACC15' : '#F87171'
  const r = 16, circ = 2 * Math.PI * r, offset = circ - (score / 100) * circ
  return (
    <div className="relative w-10 h-10">
      <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  )
}

function PortfolioCard({ item }: { item: PortfolioItem }) {
  const isAudio = item.type.includes('audio')
  const Icon = isAudio ? Mic : FileText
  const isBefore = item.type === 'before_audio'
  return (
    <div className="rounded-[20px] p-5 space-y-4" style={{ background: '#1A1917' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: isAudio ? (isBefore ? 'rgba(248,113,113,0.12)' : 'rgba(74,222,128,0.12)') : 'rgba(96,165,250,0.12)' }}>
            <Icon className="h-4 w-4" style={{ color: isAudio ? (isBefore ? '#F87171' : '#4ADE80') : '#60A5FA' }} />
          </div>
          <div>
            <p className="text-[13px] font-medium text-white" style={{ letterSpacing: '-0.013em' }}>{item.title || TYPE_LABELS[item.type]}</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#555' }}>
              {TYPE_LABELS[item.type]}{item.theme && ` · ${item.theme}`}
            </p>
          </div>
        </div>
        <ScoreRing score={item.score} />
      </div>
      {item.transcription && (
        <p className="text-[12px] leading-relaxed line-clamp-3" style={{ color: '#777', letterSpacing: '-0.012em' }}>
          "{item.transcription}"
        </p>
      )}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px]" style={{ color: '#555' }}>
          {new Date(item.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
          {item.duration && ` · ${item.duration}`}
        </span>
        <div className="flex gap-2">
          {isAudio && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium" style={{ background: '#252320', color: '#FFF' }}>
              <Play className="h-3 w-3" /> Ouvir
            </button>
          )}
          <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#252320', color: '#666' }}>
            <Download className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

function NewItemModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab]           = useState<'audio' | 'text'>('audio')
  const [title, setTitle]       = useState('')
  const [textContent, setText]  = useState('')
  const [recording, setRecording] = useState<'idle' | 'recording' | 'processing'>('idle')
  const [transcription, setTranscription] = useState('')
  const [seconds, setSeconds]   = useState(0)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')
  const recRef  = useRef<MediaRecorder | null>(null)
  const chunks  = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fmt = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  async function startRec() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
    const rec = new MediaRecorder(stream, { mimeType: mime })
    chunks.current = []
    rec.ondataavailable = e => { if (e.data.size > 0) chunks.current.push(e.data) }
    rec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      setRecording('processing')
      const blob = new Blob(chunks.current, { type: 'audio/webm' })
      const fd = new FormData(); fd.append('audio', blob, 'portfolio.webm')
      const res = await fetch('/api/ai/transcribe', { method: 'POST', body: fd })
      const data = await res.json()
      setTranscription(data.text ?? '')
      setRecording('idle')
    }
    rec.start(250); recRef.current = rec
    setRecording('recording'); setSeconds(0)
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }

  function stopRec() {
    if (timerRef.current) clearInterval(timerRef.current)
    recRef.current?.stop()
  }

  async function save() {
    setSaving(true); setError('')
    const result = await addPortfolioItem({
      type: tab,
      title: title || (tab === 'audio' ? 'Áudio' : 'Texto'),
      transcription: tab === 'audio' ? transcription : undefined,
      contentText: tab === 'text' ? textContent : undefined,
    })
    if (result.error) { setError(result.error); setSaving(false) }
    else { setSaved(true); setTimeout(onClose, 1200) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-md rounded-[24px] overflow-hidden" style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <span className="text-[14px] font-semibold text-white">Nova produção</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10">
            <X className="h-4 w-4" style={{ color: '#666' }} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {saved ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)' }}>
                <Check className="h-6 w-6" style={{ color: '#4ADE80' }} />
              </div>
              <p className="text-[14px] font-medium text-white">Salvo no portfólio!</p>
            </div>
          ) : (
            <>
              <div className="flex gap-1 p-1 rounded-[14px]" style={{ background: '#252320' }}>
                {(['audio', 'text'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-[10px] text-[13px] font-medium transition-all"
                    style={{ background: tab === t ? '#1A1917' : 'transparent', color: tab === t ? '#FFF' : '#555' }}>
                    {t === 'audio' ? <Mic className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                    {t === 'audio' ? 'Áudio' : 'Texto'}
                  </button>
                ))}
              </div>

              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Título (ex: Apresentação semana 3)"
                className="w-full px-3 py-2 rounded-xl text-[13px] text-white outline-none"
                style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)' }} />

              {tab === 'audio' ? (
                <div className="rounded-[16px] p-5 flex flex-col items-center gap-3 text-center" style={{ background: '#252320' }}>
                  {recording === 'idle' && !transcription && (
                    <>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.12)' }}>
                        <Mic className="h-5 w-5" style={{ color: '#4ADE80' }} />
                      </div>
                      <button onClick={startRec} className="px-5 py-2 rounded-full text-[12px] font-medium" style={{ background: '#4ADE80', color: '#000' }}>
                        Iniciar gravação
                      </button>
                    </>
                  )}
                  {recording === 'recording' && (
                    <>
                      <div className="w-12 h-12 rounded-full animate-pulse flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                        <div className="w-4 h-4 rounded-full" style={{ background: '#EF4444' }} />
                      </div>
                      <p className="text-[18px] font-medium tabular-nums text-white">{fmt(seconds)}</p>
                      <button onClick={stopRec} className="flex items-center gap-2 px-5 py-2 rounded-full text-[12px] font-medium" style={{ background: '#EF4444', color: '#FFF' }}>
                        <Square className="h-3 w-3" /> Parar
                      </button>
                    </>
                  )}
                  {recording === 'processing' && (
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" style={{ color: '#A78BFA' }} />
                      <span className="text-[12px]" style={{ color: '#A78BFA' }}>Transcrevendo…</span>
                    </div>
                  )}
                  {transcription && (
                    <div className="text-left w-full space-y-2">
                      <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>Transcrição</p>
                      <p className="text-[12px] leading-relaxed" style={{ color: '#CCC' }}>{transcription}</p>
                      <button onClick={() => setTranscription('')} className="text-[11px]" style={{ color: '#555' }}>Regravar</button>
                    </div>
                  )}
                </div>
              ) : (
                <textarea value={textContent} onChange={e => setText(e.target.value)} rows={5}
                  placeholder="Escreva sua produção…"
                  className="w-full px-3 py-2 rounded-xl text-[13px] text-white outline-none resize-none"
                  style={{ background: '#252320', border: '1px solid rgba(255,255,255,0.06)' }} />
              )}

              {error && <p className="text-[12px]" style={{ color: '#F87171' }}>{error}</p>}

              <button onClick={save} disabled={saving || (tab === 'audio' ? !transcription : !textContent.trim())}
                className="w-full py-3 rounded-full text-[13px] font-medium flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Salvar no portfólio
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function PortfolioUI({ items }: { items: PortfolioItem[] }) {
  const [filter, setFilter] = useState<typeof TYPE_FILTERS[number]>('all')
  const [showNew, setShowNew] = useState(false)

  const filtered = items.filter(p => {
    if (filter === 'all') return true
    if (filter === 'audio') return p.type.includes('audio')
    return p.type === 'text' || p.type === 'presentation'
  })

  const scored = items.filter(p => p.score != null)
  const avgScore = scored.length > 0 ? Math.round(scored.reduce((a, p) => a + (p.score ?? 0), 0) / scored.length) : 0

  const before = items.find(p => p.type === 'before_audio')
  const after  = items.find(p => p.type === 'after_audio')

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {showNew && <NewItemModal onClose={() => setShowNew(false)} />}
      <div className="flex items-center justify-between px-8 border-b shrink-0" style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
        <h1 className="text-white font-medium" style={{ fontSize: 15, letterSpacing: '-0.015em' }}>Portfólio</h1>
        <div className="flex items-center gap-3">
          <span className="text-[12px]" style={{ color: '#555' }}>{items.length} produções</span>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-opacity hover:opacity-80"
            style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
            <Plus className="h-3.5 w-3.5" /> Nova produção
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {before && after && (
          <div className="gradient-orange rounded-[30px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: 'rgba(255,255,255,0.50)' }}>Antes & Depois · evolução</p>
              <TrendingUp className="h-4 w-4" style={{ color: 'rgba(255,255,255,0.50)' }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[{ label: 'Início', item: before, accent: '#F87171' }, { label: 'Agora', item: after, accent: '#4ADE80' }].map(({ label, item: p, accent }) => (
                <div key={p.id} className="rounded-[20px] p-4 space-y-3" style={{ background: 'rgba(0,0,0,0.25)' }}>
                  <p className="text-[11px] font-medium" style={{ color: accent }}>{label}</p>
                  <p className="text-[11px] italic leading-relaxed line-clamp-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    "{p.transcription}"
                  </p>
                  <div className="flex items-center justify-between">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium" style={{ background: 'rgba(255,255,255,0.12)', color: '#FFF' }}>
                      <Play className="h-3 w-3" /> Ouvir
                    </button>
                    {p.score != null && <span className="text-[13px] font-bold" style={{ color: accent }}>{p.score}/100</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Áudios gravados', value: items.filter(p => p.type.includes('audio')).length, color: '#A78BFA' },
            { label: 'Textos escritos',  value: items.filter(p => p.type === 'text').length, color: '#60A5FA' },
            { label: 'Score médio',      value: avgScore || '—', color: '#4ADE80' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-[16px] p-4 text-center" style={{ background: '#1A1917' }}>
              <p className="text-[28px] font-medium leading-none" style={{ letterSpacing: '-0.05em', color }}>{value}</p>
              <p className="text-[11px] mt-1.5" style={{ color: '#555' }}>{label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {TYPE_FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
              style={{ background: filter === f ? '#FFFFFF' : 'rgba(255,255,255,0.05)', color: filter === f ? '#0C0B0A' : '#666' }}>
              {f === 'all' ? 'Todos' : f === 'audio' ? 'Áudios' : 'Textos'}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16" style={{ color: '#555' }}>
            <p className="text-[13px]">Nenhuma produção ainda. Complete tarefas para ver seu portfólio!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map(item => <PortfolioCard key={item.id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  )
}
