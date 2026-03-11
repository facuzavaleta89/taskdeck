'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
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
  const [activeCard, setActiveCard] = useState<Card | null>(null)
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [savingColumn, setSavingColumn] = useState(false)
  const supabase = createClient()

  // Support both mouse and touch (mobile)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    const card = cards.find(c => c.id === event.active.id)
    if (card) setActiveCard(card)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeCard = cards.find(c => c.id === active.id)
    if (!activeCard) return

    const overCard   = cards.find(c => c.id === over.id)
    const overColumn = columns.find(c => c.id === over.id)

    const targetColumnId = overCard?.column_id ?? overColumn?.id
    if (!targetColumnId || activeCard.column_id === targetColumnId) return

    setCards(prev =>
      prev.map(c => c.id === activeCard.id ? { ...c, column_id: targetColumnId } : c)
    )
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveCard(null)
    if (!over) return

    const activeCardData = cards.find(c => c.id === active.id)
    if (!activeCardData) return

    const columnCards = cards
      .filter(c => c.column_id === activeCardData.column_id)
      .sort((a, b) => a.position - b.position)

    const oldIndex = columnCards.findIndex(c => c.id === active.id)
    const newIndex = columnCards.findIndex(c => c.id === over.id)

    let reordered = columnCards
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      reordered = arrayMove(columnCards, oldIndex, newIndex)
    }

    const updates = reordered.map((card, i) => ({ ...card, position: (i + 1) * 1000 }))

    setCards(prev => {
      const otherCards = prev.filter(c => c.column_id !== activeCardData.column_id)
      return [...otherCards, ...updates]
    })

    // Batch update
    await Promise.all(
      updates.map(card =>
        supabase.from('cards').update({ position: card.position, column_id: card.column_id }).eq('id', card.id)
      )
    )
  }

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
    const columnCards = cards.filter(c => c.column_id === columnId)
    const position = (columnCards.length + 1) * 1000
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase.from('cards').insert({
      title,
      column_id: columnId,
      position,
      created_by: user?.id,
    }).select().single()

    if (!error && data) {
      setCards(prev => [...prev, data])
    }
  }

  async function handleUpdateCard(updated: Card) {
    await supabase.from('cards').update({
      title: updated.title,
      description: updated.description,
      due_date: updated.due_date,
      assigned_to: updated.assigned_to,
      completed: updated.completed,
    }).eq('id', updated.id)

    setCards(prev => prev.map(c => c.id === updated.id ? updated : c))
  }

  async function handleDeleteCard(cardId: string) {
    await supabase.from('cards').delete().eq('id', cardId)
    setCards(prev => prev.filter(c => c.id !== cardId))
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden max-w-screen-2xl mx-auto w-full">
      {/* Toolbar */}
      <div className="px-4 sm:px-6 py-2 bg-black/10 flex items-center gap-2 flex-shrink-0">
        <LabelsManager
          boardId={board.id}
          initialLabels={labels}
          onLabelsChange={setLabels}
        />
      </div>

      {/* Board columns area */}
      <div className="flex-1 board-scroll p-4 sm:p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 items-start h-full" style={{ minWidth: 'max-content' }}>
            {columns.map(column => (
              <ColumnComponent
                key={column.id}
                column={column}
                cards={cards.filter(c => c.column_id === column.id).sort((a, b) => a.position - b.position)}
                labels={labels}
                onAddCard={handleAddCard}
                onUpdateCard={handleUpdateCard}
                onDeleteCard={handleDeleteCard}
                onDeleteColumn={handleDeleteColumn}
              />
            ))}

            {/* Add column */}
            <div className="flex-shrink-0 w-72">
              {addingColumn ? (
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 animate-scale-in">
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
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/90 text-slate-800 placeholder-slate-400 mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddColumn}
                      disabled={savingColumn || !newColumnName.trim()}
                      className="bg-white text-slate-800 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                      {savingColumn ? 'Agregando...' : 'Agregar lista'}
                    </button>
                    <button
                      onClick={() => { setAddingColumn(false); setNewColumnName('') }}
                      className="text-white/70 hover:text-white px-2 py-1.5 text-sm transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingColumn(true)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white rounded-xl px-4 py-3 text-sm font-medium transition-all text-left flex items-center gap-2 hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar lista
                </button>
              )}
            </div>
          </div>

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
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}