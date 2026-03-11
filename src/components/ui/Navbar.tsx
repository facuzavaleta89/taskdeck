import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { redirect } from 'next/navigation'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    profile = data
  }

  const displayName = profile?.full_name ?? user?.email ?? 'Usuario'
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white h-14 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40 flex-shrink-0">
      <Logo size="sm" href={user ? "/dashboard" : "/"} />

      <nav className="flex items-center gap-2 sm:gap-3">
        {user ? (
          <>
            <span className="text-slate-400 text-sm hidden sm:block truncate max-w-32 lg:max-w-xs pr-1">
              {displayName}
            </span>
            <div
              className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-blue-500/30"
              title={displayName}
            >
              {initials}
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="text-slate-400 hover:text-white text-sm transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-slate-800 flex items-center gap-1.5"
                title="Cerrar sesión"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-all shadow-sm"
            >
              Registro
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
