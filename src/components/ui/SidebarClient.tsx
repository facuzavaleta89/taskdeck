'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { signOutAction } from './signOutAction'

interface SidebarClientProps {
  displayName: string
  email: string
  initials: string
}

export function SidebarClient({ displayName, email, initials }: SidebarClientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: 'M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0z' },
    { href: '/', label: 'Inicio', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z' },
  ]

  return (
    <>
      {/* Mobile hamburger button - visible only on mobile */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-4 top-16 z-40 md:hidden bg-[var(--color-surface)] border border-[var(--color-border)] w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-all shadow-md"
          title="Abrir menú"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative left-0 top-0 h-screen bg-[var(--color-surface)] border-r border-[var(--color-border)] z-40 flex flex-col transform transition-all duration-300 ease-out ${
          isOpen ? 'w-64 translate-x-0' : 'w-16 -translate-x-full md:translate-x-0'
        }`}
      >
        {/* User info */}
        {isOpen && (
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="p-4 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate group-hover:text-blue-600">
                  {displayName}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] truncate">
                  {email}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Navigation */}
        <nav className={`flex-1 space-y-1 overflow-y-auto ${isOpen ? 'p-4' : 'p-2 flex flex-col items-center'}`}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isOpen ? 'w-full' : 'w-auto'
              } ${
                isActive(item.href)
                  ? 'bg-blue-600/20 text-blue-600 font-medium'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
              title={isOpen ? undefined : item.label}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {isOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Settings y Logout */}
        {isOpen && (
          <div className="p-4 border-t border-[var(--color-border)] space-y-2">
            <button
              disabled
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors text-sm opacity-60 cursor-not-allowed"
              title="Próximamente disponible"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Configuración</span>
            </button>

            <form action={signOutAction} className="w-full">
              <button
                type="submit"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-600/10 transition-colors text-sm font-medium"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar sesión</span>
              </button>
            </form>
          </div>
        )}

        {/* Close button for mobile sidebar */}
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden absolute top-4 right-4 z-50 bg-[var(--color-bg-secondary)] w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--color-border)] transition-all"
            title="Cerrar menú"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Toggle button for desktop (flechas) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="hidden md:flex absolute top-1/2 -right-5 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] w-10 h-10 rounded-lg items-center justify-center hover:bg-[var(--color-bg-secondary)] transition-all duration-300 shadow-md"
          style={{
            transform: 'translateY(-50%)',
          }}
          title={isOpen ? "Contraer menú" : "Desplegar menú"}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d={isOpen ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
          </svg>
        </button>
      </aside>
    </>
  )
}
