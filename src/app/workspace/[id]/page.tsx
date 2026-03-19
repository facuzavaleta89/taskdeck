import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import CreateBoardButton from '@/components/board/CreateBoardButton'
import InviteMemberButton from '@/components/workspace/InviteMemberButton'
import BoardsGrid from '@/components/board/BoardsGrid'
import MembersPanel from '@/components/workspace/MembersPanel'
import SentInvitationsList from '@/components/workspace/SentInvitationsList'
import { WorkspaceNameSetter } from '@/components/workspace/WorkspaceNameSetter'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  return { title: id }
}

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single()

  if (!workspace) notFound()

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspace.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/dashboard')

  const { data: boards } = await supabase
    .from('boards')
    .select('*')
    .eq('workspace_id', workspace.id)
    .order('position')   // ← ordenar por position en lugar de created_at

  const { data: memberships } = await supabase
    .from('workspace_members')
    .select('user_id, role')
    .eq('workspace_id', workspace.id)

  const memberIds = memberships?.map(m => m.user_id) ?? []

  const { data: profiles } = memberIds.length > 0
    ? await supabase.from('profiles').select('id, full_name').in('id', memberIds)
    : { data: [] }

  const { data: authUsers } = memberIds.length > 0
    ? await supabase.rpc('get_members_emails', { member_ids: memberIds })
    : { data: [] }

  const members = memberships?.map(m => ({
    user_id: m.user_id,
    role: m.role,
    full_name: profiles?.find(p => p.id === m.user_id)?.full_name ?? null,
    email: (authUsers as { id: string; email: string }[])?.find(u => u.id === m.user_id)?.email ?? '',
  })) ?? []

  const isOwner = membership.role === 'owner'

  // ─── Invitaciones enviadas pendientes para este workspace ──────────────────────
  const { data: sentInvitations } = isOwner
    ? await supabase
        .from('invitations')
        .select('id, email, workspace_id, workspaces(name)')
        .eq('workspace_id', workspace.id)
        .eq('accepted', false)
    : { data: [] }

  const sentInvitationItems = (sentInvitations ?? []).map((inv: any) => ({
    id:            inv.id,
    email:         inv.email,
    workspace_id:  inv.workspace_id,
    workspaceName: inv.workspaces?.name ?? 'Workspace',
  }))

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 bg-[var(--color-bg)]">
      <WorkspaceNameSetter workspaceName={workspace.name} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] truncate">{workspace.name}</h2>
        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
          {isOwner && <InviteMemberButton workspaceId={workspace.id} workspaceName={workspace.name} />}
          <CreateBoardButton workspaceId={workspace.id} />
        </div>
      </div>

      {/* Boards con DnD */}
      <BoardsGrid
        initialBoards={boards ?? []}
        workspaceId={workspace.id}
        isOwner={isOwner}
      />

      {/* Miembros */}
      <MembersPanel
        members={members}
        currentUserId={user.id}
        isOwner={isOwner}
        workspaceId={workspace.id}
      />

      {/* Invitaciones enviadas pendientes */}
      {isOwner && sentInvitationItems.length > 0 && (
        <div className="mt-8">
          <SentInvitationsList invitations={sentInvitationItems} />
        </div>
      )}
    </main>
  )
}