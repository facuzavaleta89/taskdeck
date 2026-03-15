'use client'

import { useState, useRef, useEffect } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createClient } from '@/lib/supabase/client'
import BoardCard from './BoardCard'
import type { Board } from '@/types'

interface SortableBoardCardProps {
  board: Board
  workspaceId: string
  isOwner: boolean
}

function SortableBoardCard({ board, workspaceId, isOwner }: SortableBoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: board.id, data: { type: 'board' } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} suppressHydrationWarning>
      <BoardCard
        board={board}
        workspaceId={workspaceId}
        isOwner={isOwner}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

interface Props {
  initialBoards: Board[]
  workspaceId: string
  isOwner: boolean
}

export default function BoardsGrid({ initialBoards, workspaceId, isOwner }: Props) {
  const [boards, setBoards] = useState<Board[]>(
    [...initialBoards].sort((a, b) => a.position - b.position)
  )
  const [activeBoard, setActiveBoard] = useState<Board | null>(null)
  const boardsRef = useRef(boards)
  useEffect(() => { boardsRef.current = boards }, [boards])

  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveBoard(boardsRef.current.find(b => b.id === event.active.id) ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveBoard(null)
    if (!over || active.id === over.id) return

    const oldIndex = boardsRef.current.findIndex(b => b.id === active.id)
    const newIndex = boardsRef.current.findIndex(b => b.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(boardsRef.current, oldIndex, newIndex)
    const updates   = reordered.map((b, i) => ({ ...b, position: (i + 1) * 1000 }))
    setBoards(updates)

    await Promise.all(
      updates.map(b =>
        supabase.from('boards').update({ position: b.position }).eq('id', b.id)
      )
    )
  }

  if (boards.length === 0) {
    return (
      <div className="text-center py-24 sm:py-32 animate-fade-in">
        <div className="w-16 h-16 bg-[var(--color-bg-secondary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-[var(--color-text-primary)] font-semibold mb-1">Sin tableros todavía</p>
        <p className="text-[var(--color-text-secondary)] text-sm">Aún no has creado ningún tablero en este workspace.</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={boards.map(b => b.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 animate-fade-in">
          {boards.map(board => (
            <SortableBoardCard
              key={board.id}
              board={board}
              workspaceId={workspaceId}
              isOwner={isOwner}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeBoard && (
          <div className="rotate-1 scale-105 opacity-90">
            <BoardCard
              board={activeBoard}
              workspaceId={workspaceId}
              isOwner={false}
              dragHandleProps={{}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}