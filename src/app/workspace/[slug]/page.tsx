import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import CreateBoardButton from '@/components/board/CreateBoardButton'
import InviteMemberButton from '@/components/workspace/InviteMemberButton'
import BoardCard from '@/components/board/BoardCard'
import { WorkspaceNameSetter } from '@/components/workspace/WorkspaceNameSetter'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return { title: slug }
}

export default async function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', slug)
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
    .order('created_at')

  const isOwner = membership.role === 'owner'

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <WorkspaceNameSetter workspaceName={workspace.name} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] truncate">{workspace.name}</h2>
        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
          {isOwner && <InviteMemberButton workspaceId={workspace.id} />}
          <CreateBoardButton workspaceId={workspace.id} />
        </div>
      </div>

      {/* Boards */}
      {!boards || boards.length === 0 ? (
        <div className="text-center py-24 sm:py-32 animate-fade-in">
          <div className="w-16 h-16 bg-[var(--color-bg-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-[var(--color-text-primary)] font-semibold mb-1">Sin tableros todavía</p>
          <p className="text-[var(--color-text-secondary)] text-sm">Aún no has creado ningún tablero en este workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 animate-fade-in">
          {boards.map(board => (
            <BoardCard key={board.id} board={board} slug={slug} isOwner={isOwner} />
          ))}
        </div>
      )}
    </main>
  )
}