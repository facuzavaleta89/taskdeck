'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'

export default function InviteMemberButton({ workspaceId, workspaceName }: { workspaceId: string, workspaceName: string }) {
  const [open, setOpen]       = useState(false)
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)

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
  }

  function handleClose() {
    setOpen(false)
    setEmail('')
    setError('')
    setSuccess(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-1.5"
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
                <h3 className="text-base font-semibold text-slate-800 mb-1">Invitación enviada</h3>
                <p className="text-sm text-slate-400">
                  Le enviamos un email a <strong className="text-slate-600">{email}</strong> con el link para unirse.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-5 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-semibold text-slate-800 mb-1">Invitar al workspace</h3>
                <p className="text-sm text-slate-400 mb-5">Ingresá el email de la persona a invitar.</p>

                <input
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInvite()}
                  autoFocus
                  className="w-full px-4 py-2.5 bg-white text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
                />

                {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

                <div className="flex gap-3 justify-end mt-4">
                  <button onClick={handleClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
                    Cancelar
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={loading || !email.trim()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
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