'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ConfirmModal } from '@/components/ui/Modal'

interface Member {
  user_id: string
  role: string
  full_name: string | null
  email: string
}

interface Props {
  members: Member[]
  currentUserId: string
  isOwner: boolean
  workspaceId: string
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner:  { label: 'Propietario', color: 'bg-violet-100 text-violet-700' },
  admin:  { label: 'Admin',       color: 'bg-blue-100 text-blue-700' },
  member: { label: 'Miembro',     color: 'bg-slate-100 text-slate-600' },
}

export default function MembersPanel({ members, currentUserId, isOwner, workspaceId }: Props) {
  const [confirmMember, setConfirmMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router   = useRouter()

  async function handleRemove(member: Member) {
    setLoading(true)
    await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', member.user_id)
    setLoading(false)
    setConfirmMember(null)
    router.refresh()
  }

  const initials = (name: string | null, email: string) =>
    name
      ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
      : email[0].toUpperCase()

  return (
    <>
      <section className="mt-10">
        <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
          Miembros del workspace
        </h3>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          {members.map((member, i) => {
            const roleInfo = ROLE_LABELS[member.role] ?? { label: member.role, color: 'bg-slate-100 text-slate-600' }
            const isCurrentUser = member.user_id === currentUserId
            const canRemove = isOwner && !isCurrentUser && member.role !== 'owner'

            return (
              <div
                key={member.user_id}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${
                  i < members.length - 1 ? 'border-b border-[var(--color-border)]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {initials(member.full_name, member.email)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {member.full_name ?? member.email}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs text-[var(--color-text-muted)]">(vos)</span>
                      )}
                    </p>
                    {member.full_name && (
                      <p className="text-xs text-[var(--color-text-muted)]">{member.email}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleInfo.color}`}>
                    {roleInfo.label}
                  </span>
                  {canRemove && (
                    <button
                      onClick={() => setConfirmMember(member)}
                      className="text-xs text-[var(--color-text-muted)] hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {confirmMember && (
        <ConfirmModal
          title="¿Eliminar miembro?"
          message={`Se eliminará a ${confirmMember.full_name ?? confirmMember.email} del workspace.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={() => handleRemove(confirmMember)}
          onCancel={() => setConfirmMember(null)}
        />
      )}
    </>
  )
}