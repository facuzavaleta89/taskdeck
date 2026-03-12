import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = {
  title: 'Mi Perfil',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single()
    profile = data
  }

  const displayName = profile?.full_name ?? user?.email ?? 'Usuario'
  const avatarUrl = profile?.avatar_url
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Mi Perfil</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Card Principal */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 sm:p-8 mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Información Personal</h2>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {initials}
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">Nombre Completo</p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">{displayName}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">
                ID de usuario: <span className="font-mono text-xs text-[var(--color-text-secondary)]">{user.id}</span>
              </p>
            </div>
          </div>

          {/* Grid de información */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-[var(--color-border)]">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">Correo Electrónico</p>
              <p className="text-[var(--color-text-primary)] font-medium break-all">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">Estado de Verificación</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${user.email_confirmed_at ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <p className="text-[var(--color-text-primary)] font-medium">
                  {user.email_confirmed_at ? 'Verificado' : 'Pendiente de verificación'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-2">Cuenta Creada</p>
              <p className="text-[var(--color-text-primary)] font-medium">
                {new Date(user.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">Espacios de Trabajo</p>
            <p className="text-2xl font-bold text-blue-600">-</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Próximamente</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">Tableros</p>
            <p className="text-2xl font-bold text-green-600">-</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Próximamente</p>
          </div>
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
            <p className="text-sm text-[var(--color-text-secondary)] mb-2">Tareas Asignadas</p>
            <p className="text-2xl font-bold text-purple-600">-</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">Próximamente</p>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl p-4">
          <p className="text-sm text-[var(--color-text-secondary)] mb-3">
            ¿Necesitas hacer cambios en tu perfil? Próximamente podrás:
          </p>
          <ul className="text-sm text-[var(--color-text-secondary)] space-y-2 ml-4 list-disc">
            <li>Cambiar tu nombre completo</li>
            <li>Actualizar tu foto de perfil</li>
            <li>Modificar tu contraseña</li>
            <li>Gestionar tus preferencias de notificaciones</li>
          </ul>
        </div>

        {/* Botón volver */}
        <div className="mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
