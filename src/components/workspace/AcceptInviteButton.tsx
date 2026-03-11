'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  token: string
  workspaceSlug: string
}

export default function AcceptInviteButton({ token, workspaceSlug }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
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

    router.push(`/workspace/${workspaceSlug}`)
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