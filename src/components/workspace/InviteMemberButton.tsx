'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Modal } from '@/components/ui/Modal'
import { useRouter } from 'next/navigation'

interface FoundUser {
  id: string
  full_name: string | null
  avatar_url: string | null
  email: string
}

export default function InviteMemberButton({ workspaceId, workspaceName }: { workspaceId: string, workspaceName: string }) {
  const [open, setOpen]             = useState(false)
  const [email, setEmail]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [searching, setSearching]   = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)
  const [foundUser, setFoundUser]   = useState<FoundUser | null>(null)
  const [notFound, setNotFound]     = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = createClient()
  const router = useRouter()

  // Buscar usuario cuando el email cambia
  useEffect(() => {
    setFoundUser(null)
    setNotFound(false)
    setError('')

    if (!email.trim() || !email.includes('@')) return

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const { data } = await supabase.rpc('find_user_by_email', { search_email: email.trim() })
      setSearching(false)

      if (data && data.length > 0) {
        setFoundUser(data[0])
        setNotFound(false)
      } else {
        setFoundUser(null)
        setNotFound(true)
      }
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [email])

  async function handleInvite() {
    if (!email.trim()) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, workspaceId, workspaceName }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Error al enviar la invitación')
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()
  }

  function handleClose() {
    setOpen(false)
    setEmail('')
    setError('')
    setSuccess(false)
    setFoundUser(null)
    setNotFound(false)
  }

  const initials = foundUser?.full_name
    ? foundUser.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : foundUser?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border border-[var(--color-border)] text-[var(--color-text-primary)] px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-bg-secondary)] transition-colors flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        <span className="hidden sm:inline">Invitar miembro</span>
        <span className="sm:hidden">Invitar</span>
      </button>

      {open && (
        <Modal onClose={handleClose} size="sm">
          <div className="p-6">
            {success ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Invitación enviada</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Le enviamos un email a <strong className="text-[var(--color-text-primary)]">{email}</strong> con el link para unirse.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-5 bg-[var(--color-brand)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-brand-hover)] transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Invitar al workspace</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-5">Ingresá el email de la persona a invitar.</p>

                <div className="relative">
                  <input
                    type="email"
                    placeholder="email@ejemplo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                    className="w-full px-4 py-2.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] text-sm"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 text-[var(--color-text-muted)] animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Usuario encontrado */}
                {foundUser && (
                  <div className="mt-3 flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {foundUser.full_name ?? foundUser.email}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">{foundUser.email}</p>
                    </div>
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Usuario no encontrado */}
                {notFound && email.includes('@') && (
                  <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
                    </svg>
                    <p className="text-xs text-amber-600">
                      Este email no está registrado. Le llegará una invitación para crear su cuenta.
                    </p>
                  </div>
                )}

                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

                <div className="flex gap-3 justify-end mt-5">
                  <button onClick={handleClose} className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={loading || !email.trim() || !email.includes('@')}
                    className="bg-[var(--color-brand)] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[var(--color-brand-hover)] disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Invitando...' : 'Invitar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}