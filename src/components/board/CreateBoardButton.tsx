'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'

const COLORS = [
  '#0079bf', '#d29034', '#519839', '#b04632',
  '#89609e', '#cd5a91', '#4bbf6b', '#00aecc',
]

export default function CreateBoardButton({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen]       = useState(false)
  const [name, setName]       = useState('')
  const [color, setColor]     = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const router  = useRouter()
  const supabase = createClient()

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Sin sesión activa.'); setLoading(false); return }

    const { error: err } = await supabase.from('boards').insert({
      name: name.trim(),
      workspace_id: workspaceId,
      created_by: user.id,
      color,
    })

    if (err) { setError(err.message.includes('unique') ? 'Ya existe un tablero con ese nombre en este workspace.' : err.message); setLoading(false); return }

    setOpen(false)
    setName('')
    setColor(COLORS[0])
    setLoading(false)
    router.refresh()
  }

  function handleClose() {
    setOpen(false)
    setName('')
    setError('')
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-[var(--color-brand)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-brand-hover)] transition-all hover:shadow-md flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="hidden sm:inline">Nuevo tablero</span>
        <span className="sm:hidden">Tablero</span>
      </button>

      {open && (
        <Modal onClose={handleClose} size="sm">
          <div className="p-6">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Crear tablero</h3>

            {/* Preview */}
            <div
              className="w-full h-20 rounded-xl mb-4 flex items-center px-4 text-white font-semibold"
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
                    outline: color === c ? '2px solid var(--color-brand)' : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>

            <input
              type="text"
              placeholder="Nombre del tablero (máx. 20 caracteres)"
              value={name}
              onChange={e => setName(e.target.value.slice(0, 20))}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
              maxLength={20}
              className="w-full px-4 py-2.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] text-sm mb-2"
            />

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex gap-3 justify-end mt-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !name.trim()}
                className="bg-[var(--color-brand)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-brand-hover)] disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}