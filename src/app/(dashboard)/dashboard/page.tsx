import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateWorkspaceButton from '@/components/workspace/CreateWorkspaceButton'
import WorkspaceCard from '@/components/workspace/WorkspaceCard'
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

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Panel principal</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Mis Workspaces</h2>
        </div>
        <CreateWorkspaceButton />
      </div>

      {/* Empty state */}
      {workspaces.length === 0 ? (
        <div className="text-center py-24 sm:py-32 animate-fade-in">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-slate-600 font-semibold text-base mb-1">Sin workspaces todavía</p>
          <p className="text-slate-400 text-sm mb-6">Creá uno para empezar a organizar tus proyectos</p>
          <CreateWorkspaceButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 animate-fade-in">
          {workspaces.map(ws => (
            <WorkspaceCard key={ws.id} workspace={ws} currentUserId={user.id} />
          ))}
        </div>
      )}
    </main>
  )
}