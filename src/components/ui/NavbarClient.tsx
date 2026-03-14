'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface NavbarClientProps {
  displayName: string
  initials: string
  onSignOut: () => void
}

export function NavbarClient({ displayName, initials, onSignOut }: NavbarClientProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Divider */}
      <div className="w-px h-5 bg-[var(--color-border)] mx-1 hidden sm:block" />

      {/* User */}
      <Link
        href="/profile"
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors group"
        title="Mi perfil"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <span className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors hidden sm:block truncate max-w-28 lg:max-w-xs">
          {displayName}
        </span>
      </Link>

      {/* Sign out */}
      <form action={onSignOut}>
        <button
          type="submit"
          className="text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-colors"
          title="Cerrar sesión"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </form>

    </div>
  )
}