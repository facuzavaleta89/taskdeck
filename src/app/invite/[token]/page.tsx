import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import AcceptInviteButton from '@/components/workspace/AcceptInviteButton'
import { Logo } from '@/components/ui/Logo'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Invitación a workspace' }

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: invitation } = await supabase
    .from('invitations')
    .select('*, workspaces(name, slug)')
    .eq('token', token)
    .eq('accepted', false)
    .single()

  const workspace = invitation?.workspaces as unknown as { name: string; slug: string }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="mb-8">
        <Logo size="md" href="/" />
      </div>

      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center animate-scale-in">
        {!invitation ? (
          <>
            {/* Invalid invite */}
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Invitación inválida</h2>
            <p className="text-slate-500 text-sm mb-6">Este link ya fue usado o expiró.</p>
            <Link
              href="/dashboard"
              className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Ir al inicio
            </Link>
          </>
        ) : (
          <>
            {/* Valid invite */}
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Fuiste invitado 🎉</h2>
            <p className="text-slate-500 text-sm mb-6">
              Te invitaron a unirte al workspace{' '}
              <span className="font-semibold text-slate-800">{workspace?.name}</span>
            </p>

            {user ? (
              <AcceptInviteButton token={token} workspaceSlug={workspace?.slug} />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-400 mb-4">Necesitás una cuenta para unirte.</p>
                <Link
                  href={`/register?next=/invite/${token}`}
                  className="block w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
                >
                  Crear cuenta gratis
                </Link>
                <Link
                  href={`/login?next=/invite/${token}`}
                  className="block w-full border border-slate-200 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm"
                >
                  Ya tengo cuenta
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}