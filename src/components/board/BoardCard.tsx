'use client'

import { useState } from 'react'
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
  slug: string
  isOwner: boolean
}

export default function BoardCard({ board, slug, isOwner }: Props) {
  const [menuOpen, setMenuOpen]   = useState(false)
  const [editOpen, setEditOpen]   = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [name, setName]   = useState(board.name)
  const [color, setColor] = useState(board.color)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
    router.refresh()
  }

  return (
    <>
      <div className="relative rounded-xl shadow-sm group">
        <Link
          href={`/workspace/${slug}/board/${board.id}`}
          className="block p-5 text-white font-semibold text-base hover:brightness-90 transition-all rounded-xl min-h-[140px] flex items-start break-words overflow-hidden"
          style={{ backgroundColor: color }}
        >
          {name}
        </Link>

        {isOwner && (
          <>
            <button
              onClick={e => { e.preventDefault(); setMenuOpen(v => !v) }}
              className="absolute top-2.5 right-2.5 text-white/70 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/25 transition-all opacity-0 group-hover:opacity-100 z-10"
              title="Opciones"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
              </svg>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.preventDefault(); setMenuOpen(false); }} />
                <div className="absolute bg-white border border-slate-200 rounded-xl shadow-xl z-50 w-40 py-1.5 overflow-hidden animate-scale-in origin-top-right right-2.5 top-10">
                  <button
                    onClick={(e) => { e.preventDefault(); setEditOpen(true); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Editar
                  </button>
                  <div className="mx-3 my-1 h-px bg-slate-100" />
                  <button
                    onClick={(e) => { e.preventDefault(); setConfirmDelete(true); setMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>



      {/* Edit modal */}
      {editOpen && (
        <Modal onClose={() => setEditOpen(false)} size="sm">
          <div className="p-6">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Editar tablero</h3>

            {/* Preview */}
            <div
              className="w-full h-16 rounded-xl mb-4 flex items-center px-4 text-white font-semibold text-sm"
              style={{ backgroundColor: color }}
            >
              {name || 'Vista previa'}
            </div>

            {/* Color picker */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-8 h-8 rounded-lg transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? '2px solid #1d4ed8' : 'none',
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
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-sm mb-4"
            />

            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditOpen(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !name.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
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