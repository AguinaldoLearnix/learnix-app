'use client'

import { useState } from 'react'
import { Search, Plus, ChevronRight } from 'lucide-react'

type User = {
  id: string
  full_name: string
  email: string
  role: string
  is_active: boolean
  created_at: string
  current_level?: string
  plan_type?: string
  subscription_status?: string
  teacher_name?: string
}

type RoleFilter = 'all' | 'student' | 'teacher' | 'admin'

const ROLE_LABEL: Record<string, string> = {
  student: 'Aluno', teacher: 'Professor', admin: 'Admin', group_student: 'Aluno (grupo)',
}
const ROLE_COLOR: Record<string, { bg: string; text: string }> = {
  student:       { bg: 'rgba(96,165,250,0.12)',  text: '#60A5FA' },
  group_student: { bg: 'rgba(96,165,250,0.10)',  text: '#60A5FA' },
  teacher:       { bg: 'rgba(250,204,21,0.12)',  text: '#FACC15' },
  admin:         { bg: 'rgba(248,113,113,0.12)', text: '#F87171' },
}
const SUB_COLOR: Record<string, string> = {
  active: '#4ADE80', trial: '#FACC15', paused: '#777', cancelled: '#F87171',
}
const SUB_LABEL: Record<string, string> = {
  active: 'Ativo', trial: 'Trial', paused: 'Pausado', cancelled: 'Cancelado',
}

export function UsersUI({ users }: { users: User[] }) {
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')

  const filtered = users.filter(u => {
    const matchQ = !query ||
      u.full_name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
    const matchR = roleFilter === 'all' || u.role === roleFilter
    return matchQ && matchR
  })

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between px-8 border-b shrink-0" style={{ height: 56, borderColor: 'rgba(255,255,255,0.07)' }}>
        <h1 className="text-white font-medium" style={{ fontSize: 15, letterSpacing: '-0.015em' }}>Usuários</h1>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-opacity hover:opacity-80"
          style={{ background: '#FFFFFF', color: '#0C0B0A' }}>
          <Plus className="h-3.5 w-3.5" /> Novo usuário
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 max-w-sm"
            style={{ background: '#1A1917', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Search className="h-3.5 w-3.5 shrink-0" style={{ color: '#555' }} />
            <input value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Buscar por nome ou e-mail…"
              className="flex-1 text-[12px] bg-transparent outline-none text-white placeholder:text-[#444]" />
          </div>

          {(['all', 'student', 'teacher', 'admin'] as RoleFilter[]).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all"
              style={{ background: roleFilter === r ? '#FFFFFF' : 'rgba(255,255,255,0.05)', color: roleFilter === r ? '#0C0B0A' : '#666' }}>
              {r === 'all' ? `Todos (${users.length})` : ROLE_LABEL[r]}
            </button>
          ))}
        </div>

        <div className="rounded-[20px] overflow-hidden" style={{ background: '#1A1917' }}>
          <div className="grid px-5 py-3 text-[10px] font-medium uppercase tracking-[0.06em]"
            style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 40px', color: '#444', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <span>Usuário</span><span>E-mail</span><span>Role</span><span>Nível</span><span>Status</span><span />
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center" style={{ color: '#444' }}>
              <p className="text-[13px]">Nenhum usuário encontrado</p>
            </div>
          ) : filtered.map((u, i) => {
            const roleStyle = ROLE_COLOR[u.role] ?? { bg: 'rgba(255,255,255,0.06)', text: '#888' }
            const subColor = u.subscription_status ? (SUB_COLOR[u.subscription_status] ?? '#555') : (u.is_active ? '#4ADE80' : '#555')
            const subLabel = u.subscription_status ? (SUB_LABEL[u.subscription_status] ?? u.subscription_status) : (u.is_active ? 'Ativo' : 'Inativo')
            return (
              <div key={u.id}
                className="grid items-center px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                style={{ gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr 40px', borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0"
                    style={{ background: '#252320', color: '#FFF' }}>
                    {u.full_name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <span className="text-[13px] font-medium text-white truncate" style={{ letterSpacing: '-0.013em' }}>{u.full_name}</span>
                </div>
                <span className="text-[12px] truncate" style={{ color: '#555' }}>{u.email}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full w-fit" style={{ background: roleStyle.bg, color: roleStyle.text }}>
                  {ROLE_LABEL[u.role] ?? u.role}
                </span>
                <span className="text-[12px]" style={{ color: '#666' }}>{u.current_level ?? '—'}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: subColor }} />
                  <span className="text-[11px]" style={{ color: subColor }}>{subLabel}</span>
                </div>
                <ChevronRight className="h-4 w-4 justify-self-end" style={{ color: '#333' }} />
              </div>
            )
          })}
        </div>

        <p className="text-[11px] text-center" style={{ color: '#444' }}>
          {filtered.length} de {users.length} usuários
        </p>
      </div>
    </div>
  )
}
