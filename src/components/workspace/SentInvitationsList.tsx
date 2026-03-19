'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ConfirmModal } from '@/components/ui/Modal'

interface SentInvitation {
  id: string
  email: string
  workspace_id: string
  workspaceName: string
}

interface Props {
  invitations: SentInvitation[]
}

export default function SentInvitationsList({ invitations: initial }: Props) {
  const [invitations, setInvitations] = useState(initial)
  const [toCancel, setToCancel]       = useState<SentInvitation | null>(null)
  const [cancelling, setCancelling]   = useState(false)
  const supabase = useMemo(() => createClient(), [])

  async function handleCancel(inv: SentInvitation) {
    setCancelling(true)
    await supabase.from('invitations').delete().eq('id', inv.id)
    setInvitations(prev => prev.filter(i => i.id !== inv.id))
    setToCancel(null)
    setCancelling(false)
  }

  if (invitations.length === 0) return null

  return (
    <>
      <section className="animate-fade-in">
        <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
          Invitaciones enviadas pendientes
        </h3>
        <div className="space-y-3">
          {invitations.map(inv => (
            <div
              key={inv.id}
              className="flex items-center justify-between gap-4 px-5 py-4 bg-amber-500/5 border border-amber-500/30 rounded-2xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Icono de sobre / esperando */}
                <div className="w-9 h-9 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                    {inv.email}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">
                    Invitado a <span className="text-[var(--color-text-secondary)]">{inv.workspaceName}</span>
                    {' · '}
                    <span className="text-amber-500 font-medium">Pendiente</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setToCancel(inv)}
                className="text-xs text-[var(--color-text-muted)] hover:text-red-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10 flex-shrink-0"
              >
                Cancelar
              </button>
            </div>
          ))}
        </div>
      </section>

      {toCancel && (
        <ConfirmModal
          title="¿Cancelar invitación?"
          message={`Se cancelará la invitación enviada a "${toCancel.email}" para el workspace "${toCancel.workspaceName}".`}
          confirmLabel={cancelling ? 'Cancelando...' : 'Cancelar invitación'}
          danger
          onConfirm={() => handleCancel(toCancel)}
          onCancel={() => setToCancel(null)}
        />
      )}
    </>
  )
}
