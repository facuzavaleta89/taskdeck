'use client'

import { createContext, useContext, useState } from 'react'

export interface BreadcrumbItem {
  label: string
  href: string
}

interface NavigationContextType {
  breadcrumbs: BreadcrumbItem[]
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void
  workspaceName: string | null
  setWorkspaceName: (name: string | null) => void
  boardName: string | null
  setBoardName: (name: string | null) => void
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])
  const [workspaceName, setWorkspaceName] = useState<string | null>(null)
  const [boardName, setBoardName] = useState<string | null>(null)

  return (
    <NavigationContext.Provider value={{ breadcrumbs, setBreadcrumbs, workspaceName, setWorkspaceName, boardName, setBoardName }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
