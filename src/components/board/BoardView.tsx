'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
  type CollisionDetection,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { createClient } from '@/lib/supabase/client'
import type { Board, Column, Card, Label } from '@/types'
import ColumnComponent from './Column'
import CardComponent from './Card'
import LabelsManager from './LabelsManager'

interface Props {
  board: Board
  initialColumns: Column[]
  initialCards: Card[]
  initialLabels: Label[]
}

export default function BoardView({ board, initialColumns, initialCards, initialLabels }: Props) {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [cards, setCards]     = useState<Card[]>(initialCards)
  const [labels, setLabels]   = useState<Label[]>(initialLabels)
  const [activeCard,   setActiveCard]   = useState<Card | null>(null)
  const [activeColumn, setActiveColumn] = useState<Column | null>(null)
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [savingColumn, setSavingColumn] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const cardsRef            = useRef(cards)
  const columnsRef          = useRef(columns)
  const dragStartColumnRef  = useRef<string | null>(null)
  const isDraggingColumnRef = useRef(false)

  useEffect(() => { cardsRef.current   = cards   }, [cards])
  useEffect(() => { columnsRef.current = columns }, [columns])
  useEffect(() => { setLabels(initialLabels) }, [initialLabels])

  // Pre-agrupar y ordenar cards por column_id una sola vez cuando cambia `cards`,
  // en lugar de hacer .filter().sort() inline por cada columna en cada render.
  const cardsByColumn = useMemo<Record<string, typeof cards>>(() => {
    const map: Record<string, typeof cards> = {}
    for (const card of cards) {
      if (!map[card.column_id]) map[card.column_id] = []
      map[card.column_id].push(card)
    }
    for (const id in map) {
      map[id].sort((a, b) => a.position - b.position)
    }
    return map
  }, [cards])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  // ─── Collision detection personalizado ────────────────────────────────────
  // Cuando se arrastra una columna, filtra los droppables para que solo
  // considere otras columnas (ignora cartas). Así closestCenter nunca
  // devuelve una carta como "over" durante el drag de columna.
  const collisionDetection: CollisionDetection = (args) => {
    if (isDraggingColumnRef.current) {
      const columnIds = new Set(columnsRef.current.map(c => c.id))
      const onlyColumns = {
        ...args,
        droppableContainers: args.droppableContainers.filter(c => columnIds.has(c.id as string)),
      }
      return closestCenter(onlyColumns)
    }
    // Para cartas: primero busca colisión dentro de la columna (pointerWithin),
    // si no hay, usa rectIntersection para detectar la columna destino
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) return pointerCollisions
    return rectIntersection(args)
  }

  // ─── Drag handlers ─────────────────────────────────────────────────────────

  function handleDragStart(event: DragStartEvent) {
    const type = event.active.data.current?.type
    if (type === 'column') {
      isDraggingColumnRef.current = true
      setActiveColumn(columnsRef.current.find(c => c.id === event.active.id) ?? null)
      dragStartColumnRef.current = null
    } else {
      isDraggingColumnRef.current = false
      const card = cardsRef.current.find(c => c.id === event.active.id) ?? null
      setActiveCard(card)
      dragStartColumnRef.current = card?.column_id ?? null
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    if (active.data.current?.type === 'column') return

    const activeCardData = cardsRef.current.find(c => c.id === active.id)
    if (!activeCardData) return

    const overCard   = cardsRef.current.find(c => c.id === over.id)
    const overColumn = columnsRef.current.find(c => c.id === over.id)

    const targetColumnId = overCard?.column_id ?? overColumn?.id
    if (!targetColumnId || activeCardData.column_id === targetColumnId) return

    setCards(prev =>
      prev.map(c => c.id === activeCardData.id ? { ...c, column_id: targetColumnId } : c)
    )
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)
    setActiveColumn(null)
    isDraggingColumnRef.current = false

    // ── Columna ────────────────────────────────────────────────────────────
    if (active.data.current?.type === 'column') {
      if (!over || active.id === over.id) return
      const oldIndex = columnsRef.current.findIndex(c => c.id === active.id)
      const newIndex = columnsRef.current.findIndex(c => c.id === over.id)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

      const reordered = arrayMove(columnsRef.current, oldIndex, newIndex)
      const updates   = reordered.map((col, i) => ({ ...col, position: (i + 1) * 1000 }))
      setColumns(updates)

      await Promise.all(
        updates.map(col =>
          supabase.from('columns').update({ position: col.position }).eq('id', col.id)
        )
      )
      return
    }

    // ── Carta ──────────────────────────────────────────────────────────────
    const freshCards     = cardsRef.current
    const activeCardData = freshCards.find(c => c.id === active.id)
    if (!activeCardData) return

    const originalColumnId = dragStartColumnRef.current
    const currentColumnId  = activeCardData.column_id
    const columnChanged    = originalColumnId !== currentColumnId

    if (!over && !columnChanged) return
    if (active.id === over?.id && !columnChanged) return

    const columnCards = freshCards
      .filter(c => c.column_id === currentColumnId)
      .sort((a, b) => a.position - b.position)

    const oldIndex = columnCards.findIndex(c => c.id === active.id)
    const newIndex = over ? columnCards.findIndex(c => c.id === over.id) : -1

    let reordered = columnCards
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      reordered = arrayMove(columnCards, oldIndex, newIndex)
    }

    const updates = reordered.map((card, i) => ({ ...card, position: (i + 1) * 1000 }))

    setCards(prev => {
      const others = prev.filter(c => c.column_id !== currentColumnId)
      return [...others, ...updates]
    })

    await Promise.all(
      updates.map(card =>
        supabase
          .from('cards')
          .update({ position: card.position, column_id: card.column_id })
          .eq('id', card.id)
      )
    )
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────

  async function handleAddColumn() {
    if (!newColumnName.trim() || savingColumn) return
    setSavingColumn(true)
    const position = (columns.length + 1) * 1000

    const { data, error } = await supabase.from('columns').insert({
      name: newColumnName.trim(),
      board_id: board.id,
      position,
    }).select().single()

    if (!error && data) {
      setColumns(prev => [...prev, data])
      setNewColumnName('')
      setAddingColumn(false)
    }
    setSavingColumn(false)
  }

  async function handleDeleteColumn(columnId: string) {
    await supabase.from('columns').delete().eq('id', columnId)
    setColumns(prev => prev.filter(c => c.id !== columnId))
    setCards(prev => prev.filter(c => c.column_id !== columnId))
  }

  async function handleAddCard(columnId: string, title: string) {
    const columnCards = cardsRef.current.filter(c => c.column_id === columnId)
    const position    = (columnCards.length + 1) * 1000
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('cards').insert({
      title,
      column_id: columnId,
      position,
      created_by: user?.id,
    }).select().single()

    if (!error && data) setCards(prev => [...prev, data])
  }

  async function handleUpdateCard(updated: Card) {
    await supabase.from('cards').update({
      title:       updated.title,
      description: updated.description,
      due_date:    updated.due_date,
      assigned_to: updated.assigned_to,
      completed:   updated.completed,
    }).eq('id', updated.id)
    setCards(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  async function handleDeleteCard(cardId: string) {
    await supabase.from('cards').delete().eq('id', cardId)
    setCards(prev => prev.filter(c => c.id !== cardId))
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col flex-1 overflow-hidden w-full">
      <div className="px-4 sm:px-6 py-2 flex items-center gap-2 flex-shrink-0 border-b border-[var(--color-border)]" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25))' }}>
        <LabelsManager
          boardId={board.id}
          initialLabels={labels}
          onLabelsChange={setLabels}
        />
      </div>

      <div className="flex-1 overflow-hidden w-full" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75))' }}>
        <div className="board-scroll h-full w-full">
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              <div className="flex gap-3 items-start h-full p-4 sm:p-6" style={{ minWidth: 'max-content' }}>
                {columns.map(column => (
                  <ColumnComponent
                    key={column.id}
                    column={column}
                    cards={cardsByColumn[column.id] ?? []}
                    labels={labels}
                    onAddCard={handleAddCard}
                    onUpdateCard={handleUpdateCard}
                    onDeleteCard={handleDeleteCard}
                    onDeleteColumn={handleDeleteColumn}
                  />
                ))}

                <div className="flex-shrink-0 w-72">
                  {addingColumn ? (
                    <div className="bg-[var(--color-surface)] backdrop-blur-sm rounded-xl p-3 animate-scale-in border border-[var(--color-border)] shadow-sm">
                      <input
                        type="text"
                        placeholder="Nombre de la lista..."
                        value={newColumnName}
                        onChange={e => setNewColumnName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleAddColumn()
                          if (e.key === 'Escape') { setAddingColumn(false); setNewColumnName('') }
                        }}
                        autoFocus
                        className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] mb-2 border border-[var(--color-border)]"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleAddColumn}
                          disabled={savingColumn || !newColumnName.trim()}
                          className="bg-[var(--color-brand)] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50"
                        >
                          {savingColumn ? 'Agregando...' : 'Agregar lista'}
                        </button>
                        <button
                          onClick={() => { setAddingColumn(false); setNewColumnName('') }}
                          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] px-2 py-1.5 text-sm transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingColumn(true)}
                      className="w-full bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-xl px-4 py-3 text-sm font-medium transition-all text-left flex items-center gap-2 hover:shadow-lg border border-[var(--color-border)]"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Agregar lista
                    </button>
                  )}
                </div>
              </div>
            </SortableContext>

            <DragOverlay>
              {activeCard && (
                <div className="rotate-2 opacity-90 scale-105">
                  <CardComponent
                    card={activeCard}
                    labels={labels}
                    onUpdate={handleUpdateCard}
                    onDelete={handleDeleteCard}
                    isDragging
                  />
                </div>
              )}
              {activeColumn && (
                <div className="w-72 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-brand)]/50 shadow-2xl opacity-90 rotate-1 scale-105 px-3 py-3">
                  <p className="font-semibold text-sm text-[var(--color-text-primary)] px-2">
                    {activeColumn.name}
                  </p>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  )
}