'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Modal, ConfirmModal } from '@/components/ui/Modal'

const COLORS = [
  '#0079bf', '#d29034', '#519839', '#b04632',
  '#89609e', '#cd5a91', '#4bbf6b', '#00aecc',
]

interface Props {
  board: { id: string; name: string; color: string }
  workspaceId: string
  isOwner: boolean
  dragHandleProps?: Record<string, unknown>
}

export default function BoardCard({ board, workspaceId, isOwner, dragHandleProps = {} }: Props) {
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [editOpen,      setEditOpen]      = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [name,    setName]    = useState(board.name)
  const [color,   setColor]   = useState(board.color)
  const [loading, setLoading] = useState(false)
  const router   = useRouter()
  const supabase = useMemo(() => createClient(), [])

  async function handleSave() {
    if (!name.trim()) return
    setLoading(true)
    await supabase.from('boards').update({ name: name.trim(), color }).eq('id', board.id)
    setEditOpen(false)
    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    await supabase.from('boards').delete().eq('id', board.id)
    router.refresh() // Necesario: el tablero debe desaparecer del grid
  }

  return (
    <>
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-brand)]/50 hover:shadow-lg transition-all duration-200 group">

        {/* Color banner — el handle de drag va aquí */}
        <Link href={`/workspace/${workspaceId}/board/${board.id}`} className="block">
          <div
            className="w-full h-24 hover:brightness-90 transition-all rounded-t-2xl relative"
            style={{ backgroundColor: color }}
          >
            {/* Grip handle — visible al hacer hover, solo si es owner */}
            {isOwner && Object.keys(dragHandleProps).length > 0 && (
              <div
                {...dragHandleProps}
                suppressHydrationWarning
                onClick={e => e.preventDefault()}
                className="absolute top-2 left-2 w-6 h-6 flex items-center justify-center rounded-md bg-black/20 hover:bg-black/40 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-all cursor-grab active:cursor-grabbing"
                title="Arrastrar tablero"
              >
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm6-8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                </svg>
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <Link href={`/workspace/${workspaceId}/board/${board.id}`} className="block px-5 pt-4 pb-2">
          <h3 className="font-semibold text-[var(--color-text-primary)] text-sm truncate">{board.name}</h3>
          <p className="text-[var(--color-text-muted)] text-xs mt-0.5">Tablero</p>
        </Link>

        {/* Footer */}
        <div className="px-5 pb-4 flex justify-end border-t border-[var(--color-border)] pt-3 mt-2 relative">
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
                  <div className="absolute bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl z-50 w-40 py-1.5 animate-scale-in origin-top-right right-5 top-12">
                    <button
                      onClick={e => { e.preventDefault(); setEditOpen(true); setMenuOpen(false) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
                    >
                      Editar
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
            <Link
              href={`/workspace/${workspaceId}/board/${board.id}`}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--color-bg-secondary)]"
            >
              Abrir tablero →
            </Link>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editOpen && (
        <Modal onClose={() => setEditOpen(false)} size="sm">
          <div className="p-6">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Editar tablero</h3>
            <div
              className="w-full h-16 rounded-xl mb-4 flex items-center px-4 text-white font-semibold text-sm"
              style={{ backgroundColor: color }}
            >
              {name || 'Vista previa'}
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-lg transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? '2px solid var(--color-brand)' : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value.slice(0, 20))}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditOpen(false) }}
              autoFocus
              maxLength={20}
              placeholder="Máx. 20 caracteres"
              className="w-full px-4 py-2.5 border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] text-[var(--color-text-primary)] text-sm mb-4 bg-[var(--color-surface)]"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
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
          title="¿Eliminar tablero?"
          message={`Se eliminará "${board.name}" junto con todas sus columnas y tareas.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={() => { setConfirmDelete(false); handleDelete() }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}