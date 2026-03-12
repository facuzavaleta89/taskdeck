import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { NavbarClient } from '@/components/ui/NavbarClient'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

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
    const { redirect } = await import('next/navigation')
    redirect('/')
  }

  return (
    <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] h-14 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 flex-shrink-0 shadow-sm">
      <Logo size="sm" href={user ? "/dashboard" : "/"} />

      {user && (
        <div className="flex-1 flex justify-center">
          <Breadcrumbs />
        </div>
      )}

      <nav className="flex items-center gap-2 sm:gap-3 ml-auto">
        {user ? (
          <NavbarClient displayName={displayName} initials={initials} onSignOut={signOut} />
        ) : (
          <>
            <Link
              href="/login"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)]"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white text-sm font-semibold px-4 py-1.5 rounded-xl transition-all shadow-sm"
            >
              Registro
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
