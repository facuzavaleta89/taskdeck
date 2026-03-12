'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useNavigation } from '@/components/providers/NavigationProvider'

interface BreadcrumbItem {
  label: string
  href: string
}

export function Breadcrumbs() {
  const pathname = usePathname()
  const { workspaceName, boardName } = useNavigation()

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)

    if (segments.length === 0) return []
    if (segments.length === 1 && segments[0] === 'dashboard') {
      return [{ label: 'Dashboard', href: '/dashboard' }]
    }

    if (segments[0] === 'workspace' && segments.length >= 2) {
      const slug = segments[1]
      const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: workspaceName || slug.charAt(0).toUpperCase() + slug.slice(1), href: `/workspace/${slug}` }
      ]

      // Si está en /workspace/[slug]/board/[boardId]
      if (segments[2] === 'board' && segments[3]) {
        breadcrumbs.push({
          label: boardName || 'Tablero',
          href: `/workspace/${slug}/board/${segments[3]}`
        })
      }

      return breadcrumbs
    }

    return []
  }

  const breadcrumbs = getBreadcrumbs()

  if (breadcrumbs.length === 0) return null

  return (
    <nav className="hidden lg:flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center gap-2">
          {index > 0 && (
            <svg className="w-3.5 h-3.5 text-[var(--color-text-muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-[var(--color-text-primary)] font-medium truncate max-w-xs">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
