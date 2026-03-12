import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="flex-1 bg-[var(--color-bg)] flex flex-col">
      {children}
    </div>
  )
}
