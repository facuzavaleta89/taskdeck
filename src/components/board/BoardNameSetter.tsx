'use client'

import { useEffect } from 'react'
import { useNavigation } from '@/components/providers/NavigationProvider'

interface BoardNameSetterProps {
  boardName: string
}

export function BoardNameSetter({ boardName }: BoardNameSetterProps) {
  const { setBoardName } = useNavigation()

  useEffect(() => {
    setBoardName(boardName)
    return () => setBoardName(null)
  }, [boardName, setBoardName])

  return null
}
