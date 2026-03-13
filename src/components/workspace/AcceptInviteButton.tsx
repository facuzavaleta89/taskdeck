'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  token: string
  workspaceName?: string
  variant?: 'full' | 'inline'
}

export default function AcceptInviteButton({ token, workspaceName, variant = 'full' }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const router   = useRouter()
  const supabase = createClient()

  async function handleAccept() {
    setLoading(true)
    setError('')
    const { error } = await supabase.rpc('accept_invitation', {
      invitation_token: token,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.refresh()
  }

  async function handleDecline() {
  setLoading(true)
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('token', token)
  
  if (error) {
    setError(error.message)
    setLoading(false)
    return
  }
  router.refresh()
}

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        {error && <p className="text-red-500 text-xs">{error}</p>}
        <button
          onClick={handleDecline}
          disabled={loading}
          className="border border-rose-500/40 text-rose-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-rose-500/20 disabled:opacity-50 transition-colors"
        >
          Rechazar
        </button>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '...' : 'Aceptar'}
        </button>
      </div>
    )
  }

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
      >
        {loading ? 'Uniéndose...' : 'Unirse al workspace'}
      </button>
    </div>
  )
}