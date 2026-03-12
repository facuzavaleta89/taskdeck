'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

interface NavbarClientProps {
  displayName: string
  initials: string
  onSignOut: () => void
}

export function NavbarClient({ displayName, initials, onSignOut }: NavbarClientProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <span className="text-[var(--color-text-secondary)] text-sm hidden sm:block truncate max-w-32 lg:max-w-xs pr-1 hover:text-[var(--color-text-primary)]">
          {displayName}
        </span>
        <div
          className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-blue-500/30"
          title={displayName}
        >
          {initials}
        </div>
      </Link>
      <ThemeToggle />
      <form action={onSignOut}>
        <button
          type="submit"
          className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] flex items-center gap-1.5"
          title="Cerrar sesión"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Salir</span>
        </button>
      </form>
    </div>
  )
}
