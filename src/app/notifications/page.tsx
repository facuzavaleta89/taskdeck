import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AcceptInviteButton from '@/components/workspace/AcceptInviteButton'
import SentInvitationsList from '@/components/workspace/SentInvitationsList'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Notificaciones' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pendingInvitations } = await supabase
    .from('invitations')
    .select('id, token, workspace_id, invited_by, workspaces(name)')
    .eq('email', user.email!)
    .eq('accepted', false)

  const inviterIds = pendingInvitations?.map(i => i.invited_by).filter(Boolean) ?? []
  const inviterNames: Record<string, string> = {}
  for (const id of inviterIds) {
    const { data } = await supabase.rpc('get_user_display_name', { user_id: id })
    if (data) inviterNames[id] = data
  }

  // ─── Invitaciones ENVIADAS por mí (pendientes) ────────────────────────────
  const { data: sentInvitations } = await supabase
    .from('invitations')
    .select('id, email, workspace_id, workspaces(name)')
    .eq('invited_by', user.id)
    .eq('accepted', false)

  const sentInvitationItems = (sentInvitations ?? []).map((inv: any) => ({
    id:            inv.id,
    email:         inv.email,
    workspace_id:  inv.workspace_id,
    workspaceName: inv.workspaces?.name ?? 'Workspace',
  }))

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 bg-[var(--color-bg)]">
      <div className="mb-8">
        <p className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-widest mb-1">Centro de</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">Notificaciones</h2>
      </div>

      {(!pendingInvitations || pendingInvitations.length === 0) && sentInvitationItems.length === 0 ? (
        <div className="text-center py-24 rounded-2xl border border-dashed border-[var(--color-border)]">
          <div className="w-16 h-16 bg-[var(--color-bg-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <p className="text-[var(--color-text-primary)] font-semibold text-base mb-1">Sin notificaciones</p>
          <p className="text-[var(--color-text-secondary)] text-sm">Cuando alguien te invite a un workspace, aparecerá acá</p>
        </div>
      ) : (
        <>
          {pendingInvitations && pendingInvitations.length > 0 && (
            <div className="space-y-3 mb-10">
              {pendingInvitations.map(inv => {
                const ws = inv.workspaces as unknown as { name: string }
                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between gap-4 px-5 py-4 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-100">
                          Fuiste invitado a <span className="text-white">{ws?.name}</span>
                        </p>
                        {inv.invited_by && inviterNames[inv.invited_by] && (
                          <p className="text-xs text-emerald-300 mt-0.5">
                            De parte de {inviterNames[inv.invited_by]}
                          </p>
                        )}
                      </div>
                    </div>
                    <AcceptInviteButton token={inv.token} variant="inline" />
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Invitaciones enviadas pendientes ── */}
          {sentInvitationItems.length > 0 && (
            <div>
              <SentInvitationsList invitations={sentInvitationItems} />
            </div>
          )}
        </>
      )}
    </main>
  )
}