import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import BoardView from '@/components/board/BoardView'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string; boardId: string }> }): Promise<Metadata> {
  const supabase = await createClient()
  const { boardId } = await params
  const { data: board } = await supabase.from('boards').select('name').eq('id', boardId).single()
  return { title: board?.name ?? 'Tablero' }
}

export default async function BoardPage({ params }: { params: Promise<{ slug: string; boardId: string }> }) {
  const { slug, boardId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: board } = await supabase
    .from('boards')
    .select('*')
    .eq('id', boardId)
    .single()

  if (!board) notFound()

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
    .select('*, card_labels(label_id, labels(*)), checklist_items(*)')
    .in('column_id', columns?.map(c => c.id) ?? [])
    .order('position')

  const { data: labels } = await supabase
    .from('labels')
    .select('*')
    .eq('board_id', boardId)

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col" style={{ backgroundColor: board.color }}>
      {/* Board header bar */}
      <div className="px-4 sm:px-6 py-3 bg-black/20 flex items-center gap-3 flex-shrink-0">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-white/70 min-w-0" aria-label="Breadcrumb">
          <Link href="/dashboard" className="hover:text-white transition-colors whitespace-nowrap hidden sm:block">
            Dashboard
          </Link>
          <svg className="w-3.5 h-3.5 flex-shrink-0 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <Link href={`/workspace/${slug}`} className="hover:text-white transition-colors whitespace-nowrap">
            <span className="hidden sm:inline">Workspace</span>
            <svg className="w-4 h-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-white font-semibold truncate">{board.name}</span>
        </nav>
      </div>

      <BoardView
        board={board}
        initialColumns={columns ?? []}
        initialCards={cards ?? []}
        initialLabels={labels ?? []}
      />
    </div>
  )
}