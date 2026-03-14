import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="flex-1 bg-[var(--color-bg)] flex flex-col">

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-20 sm:py-32">
        <div className="max-w-2xl text-center animate-fade-in">

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text-primary)] leading-tight tracking-tight mb-5">
            Organizá tu equipo,<br />
            <span className="text-[var(--color-brand)]">sin el caos.</span>
          </h1>

          <p className="text-[var(--color-text-secondary)] text-base sm:text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Tableros Kanban, tareas y colaboración en tiempo real. Simple, rápido y sin distracciones.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)] text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-lg text-sm"
            >
              Empezar gratis →
            </Link>
            <Link
              href="/login"
              className="border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 sm:px-8 pb-20 sm:pb-28">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-8">
            Todo lo que necesitás
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: (
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                ),
                title: 'Drag & drop',
                desc: 'Mové tareas entre columnas con un simple gesto.',
                color: 'bg-blue-500/10',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                title: 'Colaboración',
                desc: 'Invitá a tu equipo y trabajen juntos en tiempo real.',
                color: 'bg-emerald-500/10',
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
                title: 'Checklists',
                desc: 'Dividí cada tarea en pasos concretos y trazables.',
                color: 'bg-violet-500/10',
              },
            ].map(f => (
              <div
                key={f.title}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-[var(--color-brand)]/40 hover:shadow-md transition-all duration-200"
              >
                <div className={`w-9 h-9 ${f.color} rounded-xl flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="text-[var(--color-text-primary)] font-semibold mb-1.5 text-sm">{f.title}</h3>
                <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-border)] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[var(--color-text-muted)] text-xs">
        <span>TaskDeck © {new Date().getFullYear()}</span>
        <span>Hecho con ❤️ para equipos productivos</span>
      </footer>

    </main>
  )
}