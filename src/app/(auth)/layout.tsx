

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center p-4">
      {/* Background decorative gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-slate-900 to-slate-900 pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">
        {children}
      </div>
    </div>
  )
}