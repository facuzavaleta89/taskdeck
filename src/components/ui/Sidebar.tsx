import { createClient } from '@/lib/supabase/server'
import { SidebarClient } from './SidebarClient'

export async function Sidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
    profile = data
  }

  const displayName = profile?.full_name ?? user?.email ?? 'Usuario'
  const email = user?.email ?? ''
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  if (!user) {
    return null
  }

  return (
    <SidebarClient 
      displayName={displayName} 
      email={email} 
      initials={initials}
    />
  )
}
