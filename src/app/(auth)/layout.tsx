

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 bg-[var(--color-bg)] flex flex-col items-center justify-center p-4">
      {/* Background decorative gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[var(--color-brand)]/10 via-[var(--color-bg)] to-[var(--color-bg)] pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">
        {children}
      </div>
    </div>
  )
}