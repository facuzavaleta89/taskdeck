import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  href?: string
  className?: string
}

const sizes = {
  sm: { icon: 'w-7 h-7', svg: 'w-4 h-4', text: 'text-base' },
  md: { icon: 'w-9 h-9', svg: 'w-5 h-5', text: 'text-lg' },
  lg: { icon: 'w-12 h-12', svg: 'w-6 h-6', text: 'text-2xl' },
}

function LogoIcon({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = sizes[size]
  return (
    <div className="flex items-center gap-2.5">
      <div className={cn('bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0', s.icon)}>
        <svg className={cn('text-white', s.svg)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
        </svg>
      </div>
      <span className={cn('font-bold tracking-tight text-[var(--color-text-primary)]', s.text)}>TaskDeck</span>
    </div>
  )
}

export function Logo({ size = 'md', href, className }: LogoProps) {
  if (href) {
    return (
      <Link href={href} className={cn('inline-flex', className)}>
        <LogoIcon size={size} />
      </Link>
    )
  }
  return (
    <div className={cn('inline-flex', className)}>
      <LogoIcon size={size} />
    </div>
  )
}
