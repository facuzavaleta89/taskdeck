import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="flex-1 bg-slate-900 flex flex-col">

      {/* Hero */}
      <section className="flex-1 flex items-center justify-center px-6 py-16 sm:py-24">
        <div className="max-w-3xl text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Organización simple y efectiva
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Tu equipo,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              un solo lugar
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Tableros Kanban, tareas y colaboración en tiempo real. Todo lo que necesitás para organizarte con tu equipo.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:shadow-xl hover:shadow-blue-500/25 text-base"
            >
              Empezar gratis →
            </Link>
            <Link
              href="/login"
              className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 sm:px-8 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              ),
              title: 'Drag & drop',
              desc: 'Mové tareas entre columnas con un simple gesto',
            },
            {
              icon: (
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              title: 'Colaboración',
              desc: 'Invitá a tu equipo y trabajen juntos en tiempo real',
            },
            {
              icon: (
                <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              ),
              title: 'Checklists',
              desc: 'Dividí cada tarea en pasos concretos y trazables',
            },
          ].map(f => (
            <div
              key={f.title}
              className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-200"
            >
              <div className="w-9 h-9 bg-slate-700/60 rounded-xl flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold mb-1.5">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-800 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-600 text-sm">
        <span>TaskDeck © {new Date().getFullYear()}</span>
        <span>Hecho con ❤️ para equipos productivos</span>
      </footer>
    </main>
  )
}