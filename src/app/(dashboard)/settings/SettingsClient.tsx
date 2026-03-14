'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Link from 'next/link'
import { ConfirmModal } from '@/components/ui/Modal'

interface Props {
  initialName: string
  email: string
}

export default function SettingsClient({ initialName, email }: Props) {
  const [name, setName]             = useState(initialName)
  const [nameLoading, setNameLoading] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)
  const [nameError, setNameError]   = useState('')

  const [pwLoading, setPwLoading]   = useState(false)
  const [pwSuccess, setPwSuccess]   = useState(false)
  const [pwError, setPwError]       = useState('')

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const supabase = createClient()
  const router   = useRouter()

  async function handleSaveName() {
    if (!name.trim()) return
    setNameLoading(true)
    setNameError('')
    setNameSuccess(false)
    const { error } = await supabase.rpc('update_profile_name', { new_name: name.trim() })
    if (error) {
      setNameError(error.message)
    } else {
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 3000)
      router.refresh()
    }
    setNameLoading(false)
  }

  async function handleResetPassword() {
    setPwLoading(true)
    setPwError('')
    setPwSuccess(false)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    })
    if (error) {
      setPwError(error.message)
    } else {
      setPwSuccess(true)
    }
    setPwLoading(false)
  }

  async function handleDeleteAccount() {
    setDeleteLoading(true)
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="space-y-6">

      {/* Perfil */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Perfil</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-5">
          Actualizá tu nombre visible en la app.{' '}
          <Link href="/profile" className="text-blue-500 hover:underline">Ver perfil completo →</Link>
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Correo electrónico
            </label>
            <p className="mt-1 px-4 py-2.5 bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl text-sm">
              {email}
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Nombre completo
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                placeholder="Tu nombre completo"
                className="flex-1 px-4 py-2.5 bg-[var(--color-surface)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] text-sm"
              />
              <button
                onClick={handleSaveName}
                disabled={nameLoading || !name.trim() || name.trim() === initialName}
                className="px-4 py-2.5 bg-[var(--color-brand)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-brand-hover)] disabled:opacity-50 transition-colors"
              >
                {nameLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
            {nameError && <p className="text-red-500 text-xs mt-1.5">{nameError}</p>}
            {nameSuccess && <p className="text-emerald-500 text-xs mt-1.5">Nombre actualizado correctamente.</p>}
          </div>
        </div>
      </section>

      {/* Apariencia */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Apariencia</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-5">Cambiá entre modo claro y oscuro.</p>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--color-text-primary)]">Tema de la interfaz</p>
          <ThemeToggle />
        </div>
      </section>

      {/* Cuenta */}
      <section className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Cuenta</h3>
        <p className="text-sm text-[var(--color-text-muted)] mb-5">Gestioná tu contraseña y cuenta.</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)]">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Cambiar contraseña</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Te enviaremos un email para resetearla</p>
            </div>
            <button
              onClick={handleResetPassword}
              disabled={pwLoading}
              className="px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl text-sm font-medium hover:bg-[var(--color-bg-secondary)] disabled:opacity-50 transition-colors"
            >
              {pwLoading ? 'Enviando...' : 'Enviar email'}
            </button>
          </div>
          {pwError && <p className="text-red-500 text-xs">{pwError}</p>}
          {pwSuccess && <p className="text-emerald-500 text-xs">Email enviado. Revisá tu bandeja de entrada.</p>}

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-red-500">Eliminar cuenta</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Esta acción no se puede deshacer</p>
            </div>
            <button
              onClick={() => setConfirmDelete(true)}
              className="px-4 py-2 border border-red-500/40 text-red-500 rounded-xl text-sm font-medium hover:bg-red-500/10 transition-colors"
            >
              Eliminar
            </button>
          </div>
        </div>
      </section>

      {confirmDelete && (
        <ConfirmModal
          title="¿Eliminar tu cuenta?"
          message="Se cerrará tu sesión. Para eliminar completamente tus datos contactá al soporte."
          confirmLabel="Eliminar"
          danger
          onConfirm={() => { setConfirmDelete(false); handleDeleteAccount() }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  )
}