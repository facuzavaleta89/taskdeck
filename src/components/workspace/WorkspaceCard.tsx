'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Modal, ConfirmModal } from '@/components/ui/Modal'

interface Props {
  workspace: {
    id: string
    name: string
    slug: string
    owner_id: string
    role: string
  }
  currentUserId: string
  ownerName?: string | null
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner:  { label: 'Propietario', color: 'bg-violet-100 text-violet-700' },
  admin:  { label: 'Admin',       color: 'bg-blue-100 text-blue-700' },
  member: { label: 'Miembro',     color: 'bg-slate-100 text-slate-600' },
}

const BG_COLORS = ['bg-blue-500', 'bg-violet-500', 'bg-emerald-500', 'bg-orange-500', 'bg-rose-500', 'bg-cyan-500']

export default function WorkspaceCard({ workspace, currentUserId, ownerName }: Props) {
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [editOpen,      setEditOpen]      = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmLeave,  setConfirmLeave]  = useState(false)
  const [name,    setName]    = useState(workspace.name)
  const [loading, setLoading] = useState(false)
  const isOwner  = workspace.owner_id === currentUserId
  const router   = useRouter()
  const supabase = createClient()

  async function handleRename() {
    if (!name.trim()) return
    setLoading(true)
    await supabase.from('workspaces').update({ name: name.trim() }).eq('id', workspace.id)
    setEditOpen(false)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    await supabase.from('workspaces').delete().eq('id', workspace.id)
    router.refresh()
  }

  async function handleLeave() {
    await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspace.id)
      .eq('user_id', currentUserId)
    router.refresh()
  }

  const letter   = workspace.name[0]?.toUpperCase() ?? '?'
  const bgColor  = BG_COLORS[workspace.name.charCodeAt(0) % BG_COLORS.length]
  const roleInfo = ROLE_LABELS[workspace.role] ?? { label: workspace.role, color: 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]' }

  return (
    <>
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-brand)]/50 hover:shadow-lg transition-all duration-200 group">
        <Link href={`/workspace/${workspace.id}`} className="block p-5">
          <div className="flex items-start gap-4">
            <div className={`w-11 h-11 ${bgColor} rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
              {letter}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[var(--color-text-primary)] text-sm truncate">{workspace.name}</h3>
              <p className="text-[var(--color-text-muted)] text-xs mt-0.5 font-mono">/{workspace.slug}</p>
              {!isOwner && ownerName && (
                <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
                  De <span className="text-[var(--color-text-secondary)]">{ownerName}</span>
                </p>
              )}
              <span className={`inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
        </Link>

        {/* Footer con opciones */}
        <div className="px-5 pb-4 flex justify-end border-t border-[var(--color-border)] pt-3 relative">
          {isOwner ? (
            <>
              <button
                onClick={e => { e.preventDefault(); setMenuOpen(v => !v) }}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)]"
                title="Opciones"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={e => { e.preventDefault(); setMenuOpen(false) }} />
                  <div className="absolute bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 w-44 py-1.5 animate-scale-in origin-top-right right-5 top-12">
                    <button
                      onClick={e => { e.preventDefault(); setEditOpen(true); setMenuOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                    >
                      Renombrar
                    </button>
                    <div className="mx-3 my-1 h-px bg-[var(--color-border)]" />
                    <button
                      onClick={e => { e.preventDefault(); setConfirmDelete(true); setMenuOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <button
              onClick={e => { e.preventDefault(); setConfirmLeave(true) }}
              className="text-xs text-[var(--color-text-muted)] hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
            >
              Salir del workspace
            </button>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <Modal onClose={() => setEditOpen(false)} size="sm">
          <div className="p-6">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Renombrar workspace</h3>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditOpen(false) }}
              autoFocus
              className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] text-[var(--color-text-primary)] text-sm mb-4 bg-[var(--color-surface)]"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleRename}
                disabled={loading || !name.trim()}
                className="bg-[var(--color-brand)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-brand-hover)] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <ConfirmModal
          title="¿Eliminar workspace?"
          message={`Se eliminará "${workspace.name}" junto con todos sus tableros y datos.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={() => { setConfirmDelete(false); handleDelete() }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}

      {/* Confirm leave */}
      {confirmLeave && (
        <ConfirmModal
          title="¿Salir del workspace?"
          message={`Vas a dejar de tener acceso a "${workspace.name}".`}
          confirmLabel="Salir"
          danger
          onConfirm={() => { setConfirmLeave(false); handleLeave() }}
          onCancel={() => setConfirmLeave(false)}
        />
      )}
    </>
  )
}