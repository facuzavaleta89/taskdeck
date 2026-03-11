import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/ui/Navbar'

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
    <html lang="es" className={inter.variable}>
      <body className="antialiased flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
