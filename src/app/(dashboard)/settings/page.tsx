import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './SettingsClient'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Configuración' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 bg-[var(--color-bg)]">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <p className="text-[var(--color-text-muted)] text-xs font-semibold uppercase tracking-widest mb-1">Preferencias</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">Configuración</h2>
        </div>
        <SettingsClient
          initialName={profile?.full_name ?? ''}
          email={user.email ?? ''}
        />
      </div>
    </main>
  )
}