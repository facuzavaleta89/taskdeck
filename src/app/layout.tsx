import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/ui/Navbar'
import { Sidebar } from '@/components/ui/Sidebar'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { NavigationProvider } from '@/components/providers/NavigationProvider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'TaskDeck – Gestión de proyectos',
    template: '%s | TaskDeck',
  },
  description: 'Tableros estilo Kanban para organizar tu equipo. Drag & drop, checklists, etiquetas y colaboración en tiempo real.',
  keywords: ['kanban', 'gestión de proyectos', 'tableros', 'tareas', 'colaboración'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </head>
      <body className="antialiased flex flex-col min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)]">
        <ThemeProvider>
          <NavigationProvider>
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                {children}
              </div>
            </div>
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
