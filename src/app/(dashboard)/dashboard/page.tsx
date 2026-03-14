import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateWorkspaceButton from '@/components/workspace/CreateWorkspaceButton'
import WorkspaceCard from '@/components/workspace/WorkspaceCard'
import AcceptInviteButton from '@/components/workspace/AcceptInviteButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Mis Workspaces' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspaces(id, name, slug, owner_id)')
    .eq('user_id', user.id)

  const workspaces = memberships?.map(m => ({
    ...(m.workspaces as unknown as { id: string; name: string; slug: string; owner_id: string }),
    role: m.role,
  })) ?? []

  const myWorkspaces     = workspaces.filter(ws => ws.owner_id === user.id)
  const sharedWorkspaces = workspaces.filter(ws => ws.owner_id !== user.id)

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

  const ownerIds = sharedWorkspaces.map(ws => ws.owner_id)
  const { data: owners } = ownerIds.length > 0
    ? await supabase.from('profiles').select('id, full_name').in('id', ownerIds)
    : { data: [] }

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 bg-[var(--color-bg)]">

      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-widest mb-1">Panel principal</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">Mis Workspaces</h2>
        </div>
        <CreateWorkspaceButton />
      </div>

      <div className="space-y-10 animate-fade-in">

        <section>
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
            Mis workspaces
          </h3>
          {myWorkspaces.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-[var(--color-border)]">
              <p className="text-[var(--color-text-primary)] font-semibold text-sm mb-1">Sin workspaces todavía</p>
              <p className="text-[var(--color-text-secondary)] text-sm">Creá uno con el botón de arriba a la derecha</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {myWorkspaces.map(ws => (
                <WorkspaceCard key={ws.id} workspace={ws} currentUserId={user.id} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-widest mb-4">
            Workspaces compartidos conmigo
          </h3>

          {pendingInvitations && pendingInvitations.length > 0 && (
            <div className="mb-4 space-y-3">
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

          {sharedWorkspaces.length === 0 && (!pendingInvitations || pendingInvitations.length === 0) ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-[var(--color-border)]">
              <p className="text-[var(--color-text-primary)] font-semibold text-sm mb-1">Sin workspaces compartidos</p>
              <p className="text-[var(--color-text-secondary)] text-sm">Cuando alguien te invite a un workspace, aparecerá acá</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
              {sharedWorkspaces.map(ws => {
                const owner = owners?.find(o => o.id === ws.owner_id)
                return (
                  <WorkspaceCard
                    key={ws.id}
                    workspace={ws}
                    currentUserId={user.id}
                    ownerName={owner?.full_name ?? null}
                  />
                )
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  )
}