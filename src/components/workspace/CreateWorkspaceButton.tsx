'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '').slice(0, 40)
}

export default function CreateWorkspaceButton() {
  const [open, setOpen]       = useState(false)
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const router  = useRouter()
  const supabase = createClient()

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('No hay sesión activa. Volvé a iniciar sesión.')
      setLoading(false)
      return
    }

    const slug = slugify(name)

    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .insert({ name: name.trim(), slug, owner_id: user.id })
      .select()
      .single()

    if (wsError) {
      setError(wsError.message.includes('unique') ? 'Ya tenés un workspace con ese nombre.' : wsError.message)
      setLoading(false)
      return
    }

    await supabase.from('workspace_members').insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: 'owner',
    })

    setOpen(false)
    setName('')
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
        <span className="hidden sm:inline">Nuevo workspace</span>
        <span className="sm:hidden">Nuevo</span>
      </button>

      {open && (
        <Modal onClose={handleClose} size="sm">
          <div className="p-6">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Crear workspace</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-5">Un workspace agrupa tus tableros y miembros.</p>

            <input
              type="text"
              placeholder="Nombre del workspace"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
              className="w-full px-4 py-2.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] text-sm mb-1"
            />

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex gap-3 justify-end mt-4">
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