'use client'

import { useEffect } from 'react'
import { useNavigation } from '@/components/providers/NavigationProvider'

interface WorkspaceNameSetterProps {
  workspaceName: string
}

export function WorkspaceNameSetter({ workspaceName }: WorkspaceNameSetterProps) {
  const { setWorkspaceName } = useNavigation()

  useEffect(() => {
    setWorkspaceName(workspaceName)
    return () => setWorkspaceName(null)
  }, [workspaceName, setWorkspaceName])

  return null
}
