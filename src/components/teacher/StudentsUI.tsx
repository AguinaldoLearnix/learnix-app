'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Users, UserPlus, ChevronRight, Copy, Check,
  Plus, X, Folder, AlertCircle, Bot,
} from 'lucide-react'
import { createInvite, createGroup, addStudentToGroup, removeStudentFromGroup, deleteGroup } from '@/app/teacher/students/actions'

type Student = {
  user_id: string
  current_level: string
  target_level: string
  language: string
  plan_type: string
  subscription_status: string
  group_id?: string | null
  user: { id: string; full_name: string; email: string; avatar_url?: string } | null
  group?: { id: string; name: string } | null
}

type Group = {
  id: string
  name: string
  language: string
  level: string
  max_students: number
  members: { student_id: string; user: { id: string; full_name: string; email: string; avatar_url?: string } | null }[]
}

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  active:    { bg: 'rgba(74,222,128,0.12)',  text: '#4ADE80' },
  trial:     { bg: 'rgba(250,204,21,0.12)',  text: '#FACC15' },
  paused:    { bg: 'rgba(255,255,255,0.06)', text: '#777' },
  cancelled: { bg: 'rgba(239,68,68,0.12)',   text: '#F87171' },
}

function InviteModal({ groups, onClose }: { groups: Group[]; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [groupId, setGroupId] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, startTransition] = useTransition()
  const [error, setError] = useState('')

  function generate() {
    setError('')
    startTransition(async () => {
      const result = await createInvite(email || undefined, groupId || undefined)
      if ('error' in result) { setError(result.error ?? 'Erro desconhecido'); return }
      setInviteUrl(result.url!)
    })
  }

  function copy() {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(inviteUrl).catch(() => fallbackCopy(inviteUrl))
    } else {
      fallbackCopy(inviteUrl)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function fallbackCopy(text: string) {
    const el = document.createElement('textarea')
    el.value = text
    el.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-[24px] p-6 space-y-5" style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold" style={{ fontSize: 16, letterSpacing: '-0.025em' }}>Convidar aluno</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: '#666' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium" style={{ color: '#666' }}>E-mail do aluno (opcional)</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="aluno@email.com"
              type="email"
              className="w-full px-4 py-3 rounded-xl text-[13px] outline-none"
              style={{ background: '#252320', color: '#FFF', border: '1px solid rgba(255,255,255,0.06)' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(0,153,255,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
            />
            <p className="text-[11px]" style={{ color: '#555' }}>Se preenchido, o link fica vinculado a este e-mail.</p>
          </div>

          {groups.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium" style={{ color: '#666' }}>Adicionar a uma turma (opcional)</label>
              <select
                value={groupId}
                onChange={e => setGroupId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-[13px] outline-none"
                style={{ background: '#252320', color: groupId ? '#FFF' : '#555', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <option value="">Nenhuma turma</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && (
          <p className="text-[12px] px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.10)', color: '#F87171' }}>{error}</p>
        )}

        {!inviteUrl ? (
          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-60"
            style={{ background: '#FFFFFF', color: '#0C0B0A' }}
          >
            {loading ? 'Gerando…' : 'Gerar link de convite'}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: '#252320' }}>
              <p className="flex-1 text-[12px] truncate" style={{ color: '#4ADE80' }}>{inviteUrl}</p>
              <button onClick={copy} className="shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/10" style={{ color: copied ? '#4ADE80' : '#666' }}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-center" style={{ color: '#555' }}>Link válido por 7 dias · use uma vez</p>
            <button onClick={generate} className="w-full py-2.5 rounded-full text-[12px] font-medium" style={{ background: '#252320', color: '#999' }}>
              Gerar novo link
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function CreateGroupModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('english')
  const [level, setLevel] = useState('B1')
  const [error, setError] = useState('')
  const [loading, startTransition] = useTransition()

  function submit() {
    if (!name.trim()) return
    startTransition(async () => {
      const result = await createGroup(name.trim(), language, level)
      if ('error' in result && result.error) { setError(result.error); return }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-sm rounded-[24px] p-6 space-y-5" style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold" style={{ fontSize: 16, letterSpacing: '-0.025em' }}>Nova turma</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10" style={{ color: '#666' }}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium" style={{ color: '#666' }}>Nome da turma</label>
            <input
              value={name} onChange={e => setName(e.target.value)}
              placeholder="Ex: Business English — Turma A"
              className="w-full px-4 py-3 rounded-xl text-[13px] outline-none"
              style={{ background: '#252320', color: '#FFF', border: '1px solid rgba(255,255,255,0.06)' }}
              onFocus={e => (e.target.style.borderColor = 'rgba(0,153,255,0.4)')}
              onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium" style={{ color: '#666' }}>Idioma</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-3 rounded-xl text-[13px] outline-none"
                style={{ background: '#252320', color: '#FFF', border: '1px solid rgba(255,255,255,0.06)' }}>
                <option value="english">Inglês</option>
                <option value="spanish">Espanhol</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium" style={{ color: '#666' }}>Nível</label>
              <select value={level} onChange={e => setLevel(e.target.value)}
                className="w-full px-3 py-3 rounded-xl text-[13px] outline-none"
                style={{ background: '#252320', color: '#FFF', border: '1px solid rgba(255,255,255,0.06)' }}>
                {['A1','A2','B1','B2','C1','C2'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>

        {error && <p className="text-[12px] px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.10)', color: '#F87171' }}>{error}</p>}

        <button onClick={submit} disabled={!name.trim() || loading}
          className="w-full py-3 rounded-full text-[13px] font-semibold transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
          {loading ? 'Criando…' : 'Criar turma'}
        </button>
      </div>
    </div>
  )
}

function GroupCard({ group, allStudents, onUpdate }: { group: Group; allStudents: Student[]; onUpdate: () => void }) {
  const [addOpen, setAddOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const memberIds = new Set(group.members.map(m => m.student_id))
  const available = allStudents.filter(s => !memberIds.has(s.user_id) && !s.group_id)

  function add(studentId: string) {
    startTransition(async () => {
      await addStudentToGroup(group.id, studentId)
      setAddOpen(false)
    })
  }

  function remove(studentId: string) {
    startTransition(async () => {
      await removeStudentFromGroup(group.id, studentId)
    })
  }

  function del() {
    if (!confirm(`Excluir turma "${group.name}"? Os alunos não serão removidos.`)) return
    startTransition(async () => { await deleteGroup(group.id) })
  }

  return (
    <div className="rounded-[20px] p-5 space-y-4" style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,153,255,0.12)' }}>
            <Folder className="h-4 w-4" style={{ color: '#0099FF' }} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-white" style={{ letterSpacing: '-0.02em' }}>{group.name}</p>
            <p className="text-[11px]" style={{ color: '#555' }}>
              {group.language === 'english' ? 'Inglês' : 'Espanhol'} · {group.level} · {group.members.length}/{group.max_students} alunos
            </p>
          </div>
        </div>
        <button onClick={del} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" style={{ color: '#555' }}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Members */}
      <div className="space-y-2">
        {group.members.length === 0 ? (
          <p className="text-[12px] text-center py-3" style={{ color: '#444' }}>Nenhum aluno nesta turma ainda</p>
        ) : group.members.map(m => (
          <div key={m.student_id} className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ background: '#252320' }}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: 'rgba(0,153,255,0.3)' }}>
                {m.user?.full_name?.[0] ?? '?'}
              </div>
              <p className="text-[12px] text-white">{m.user?.full_name ?? 'Aluno'}</p>
            </div>
            <button onClick={() => remove(m.student_id)} className="p-1 rounded-lg hover:bg-white/10" style={{ color: '#555' }}>
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add student */}
      {!addOpen ? (
        <button
          onClick={() => setAddOpen(true)}
          disabled={available.length === 0 || group.members.length >= group.max_students}
          className="flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-70 disabled:opacity-30"
          style={{ color: '#0099FF' }}
        >
          <Plus className="h-3.5 w-3.5" />
          {available.length === 0 ? 'Todos os alunos já estão em turmas' : 'Adicionar aluno'}
        </button>
      ) : (
        <div className="space-y-2">
          {available.map(s => (
            <button key={s.user_id} onClick={() => add(s.user_id)}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-left transition-colors hover:bg-white/5"
              style={{ background: '#252320' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: 'rgba(167,139,250,0.3)' }}>
                {s.user?.full_name?.[0] ?? '?'}
              </div>
              <div>
                <p className="text-[12px] text-white">{s.user?.full_name}</p>
                <p className="text-[10px]" style={{ color: '#555' }}>{s.current_level} · {s.language === 'english' ? 'Inglês' : 'Espanhol'}</p>
              </div>
            </button>
          ))}
          <button onClick={() => setAddOpen(false)} className="text-[11px]" style={{ color: '#555' }}>Cancelar</button>
        </div>
      )}
    </div>
  )
}

export function StudentsUI({ students, groups }: { students: Student[]; groups: Group[] }) {
  const [tab, setTab] = useState<'students' | 'groups'>('students')
  const [showInvite, setShowInvite] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [, startTransition] = useTransition()

  const individualStudents = students.filter(s => !s.group_id)
  const groupStudents = students.filter(s => s.group_id)

  return (
    <>
      {showInvite && <InviteModal groups={groups} onClose={() => setShowInvite(false)} />}
      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}

      <div className="flex flex-col h-full">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 border-b shrink-0" style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: '#252320' }}>
            {(['students', 'groups'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                style={{ background: tab === t ? '#FFF' : 'transparent', color: tab === t ? '#0C0B0A' : '#666' }}>
                {t === 'students' ? `Alunos (${students.length})` : `Turmas (${groups.length})`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {tab === 'groups' && (
              <button onClick={() => setShowCreateGroup(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium transition-opacity hover:opacity-80"
                style={{ background: '#252320', color: '#FFF' }}>
                <Plus className="h-3.5 w-3.5" /> Nova turma
              </button>
            )}
            <button onClick={() => setShowInvite(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold transition-opacity hover:opacity-80"
              style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
              <UserPlus className="h-3.5 w-3.5" /> Convidar aluno
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'students' ? (
            <div className="space-y-5">
              {students.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4" style={{ color: '#555' }}>
                  <Users className="h-10 w-10 opacity-30" />
                  <p className="text-[14px] font-medium text-white">Nenhum aluno ainda</p>
                  <p className="text-[13px]">Convide alunos com o botão acima.</p>
                  <button onClick={() => setShowInvite(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold mt-2"
                    style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
                    <UserPlus className="h-4 w-4" /> Convidar primeiro aluno
                  </button>
                </div>
              ) : (
                <>
                  {/* Individual students */}
                  {individualStudents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>
                        Alunos individuais · {individualStudents.length}
                      </p>
                      <div className="rounded-[20px] overflow-hidden" style={{ background: '#1A1917' }}>
                        {individualStudents.map((s, i) => {
                          const sc = STATUS_COLOR[s.subscription_status] ?? STATUS_COLOR.paused
                          return (
                            <Link key={s.user_id} href={`/teacher/students/${s.user_id}`}
                              className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                              style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0" style={{ background: 'rgba(167,139,250,0.25)' }}>
                                {s.user?.full_name?.[0] ?? '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-white truncate">{s.user?.full_name}</p>
                                <p className="text-[11px]" style={{ color: '#555' }}>{s.current_level} → {s.target_level} · {s.language === 'english' ? 'Inglês' : 'Espanhol'}</p>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>
                                {{ active: 'Ativo', trial: 'Trial', paused: 'Pausado', cancelled: 'Cancelado' }[s.subscription_status] ?? s.subscription_status}
                              </span>
                              <ChevronRight className="h-4 w-4 shrink-0" style={{ color: '#444' }} />
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Group students */}
                  {groupStudents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: '#555' }}>
                        Em turmas · {groupStudents.length}
                      </p>
                      <div className="rounded-[20px] overflow-hidden" style={{ background: '#1A1917' }}>
                        {groupStudents.map((s, i) => {
                          const sc = STATUS_COLOR[s.subscription_status] ?? STATUS_COLOR.paused
                          return (
                            <Link key={s.user_id} href={`/teacher/students/${s.user_id}`}
                              className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                              style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.05)' : undefined }}>
                              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0" style={{ background: 'rgba(0,153,255,0.25)' }}>
                                {s.user?.full_name?.[0] ?? '?'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-white truncate">{s.user?.full_name}</p>
                                <p className="text-[11px]" style={{ color: '#555' }}>
                                  {s.group?.name ?? 'Turma'} · {s.current_level}
                                </p>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.text }}>
                                {{ active: 'Ativo', trial: 'Trial', paused: 'Pausado', cancelled: 'Cancelado' }[s.subscription_status] ?? s.subscription_status}
                              </span>
                              <ChevronRight className="h-4 w-4 shrink-0" style={{ color: '#444' }} />
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {groups.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4" style={{ color: '#555' }}>
                  <Folder className="h-10 w-10 opacity-30" />
                  <p className="text-[14px] font-medium text-white">Nenhuma turma criada</p>
                  <p className="text-[13px]">Crie turmas para organizar seus alunos em grupo.</p>
                  <button onClick={() => setShowCreateGroup(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold mt-2"
                    style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
                    <Plus className="h-4 w-4" /> Criar primeira turma
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {groups.map(g => (
                    <GroupCard key={g.id} group={g} allStudents={students} onUpdate={() => {}} />
                  ))}
                  {/* Add group card */}
                  <button onClick={() => setShowCreateGroup(true)}
                    className="rounded-[20px] p-5 flex flex-col items-center justify-center gap-2 min-h-[160px] transition-colors hover:bg-white/5"
                    style={{ border: '1px dashed rgba(255,255,255,0.12)', color: '#444' }}>
                    <Plus className="h-5 w-5" />
                    <p className="text-[12px]">Nova turma</p>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
