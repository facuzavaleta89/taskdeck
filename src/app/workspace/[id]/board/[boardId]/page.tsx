import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import BoardView from '@/components/board/BoardView'
import { BoardNameSetter } from '@/components/board/BoardNameSetter'
import { WorkspaceNameSetter } from '@/components/workspace/WorkspaceNameSetter'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string; boardId: string }> }): Promise<Metadata> {
  const supabase = await createClient()
  const { boardId } = await params
  const { data: board } = await supabase.from('boards').select('name').eq('id', boardId).single()
  return { title: board?.name ?? 'Tablero' }
}

export default async function BoardPage({ params }: { params: Promise<{ id: string; boardId: string }> }) {
  const { id, boardId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: board } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single()

  if (!board) notFound()

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('id', board.workspace_id)
    .single()

  const { data: membership } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', board.workspace_id)
    .eq('user_id', user.id)
    .single()

  if (!membership) redirect('/dashboard')

  const { data: columns } = await supabase
    .from('columns')
    .select('*')
    .eq('board_id', boardId)
    .order('position')

  const { data: cards } = await supabase
    .from('cards')
    .select('*, labels:card_labels(label_id, labels(*)), checklist_items(*)')
    .in('column_id', columns?.map(c => c.id) ?? [])
    .order('position')

  const { data: labels } = await supabase
    .from('labels')
    .select('*')
    .eq('board_id', boardId)

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col" style={{ backgroundColor: board.color }}>
      <BoardNameSetter boardName={board.name} />
      <WorkspaceNameSetter workspaceName={workspace?.name ?? ''} />
      <BoardView
        board={board}
        initialColumns={columns ?? []}
        initialCards={cards ?? []}
        initialLabels={labels ?? []}
      />
    </div>
  )
}