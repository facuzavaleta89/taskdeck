'use client'

import { useMemo, useState } from 'react'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Column, Card, Label } from '@/types'
import CardComponent from './Card'
import { createClient } from '@/lib/supabase/client'
import { ConfirmModal } from '@/components/ui/Modal'

interface Props {
  column: Column
  cards: Card[]
  labels: Label[]
  onAddCard: (columnId: string, title: string) => void
  onUpdateCard: (card: Card) => void
  onDeleteCard: (cardId: string) => void
  onDeleteColumn: (columnId: string) => void
}

export default function ColumnComponent({ column, cards, labels, onAddCard, onUpdateCard, onDeleteCard, onDeleteColumn }: Props) {
  const [addingCard,    setAddingCard]    = useState(false)
  const [newCardTitle,  setNewCardTitle]  = useState('')
  const [editingName,   setEditingName]   = useState(false)
  const [columnName,    setColumnName]    = useState(column.name)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isColumnDragging,
    isOver,
  } = useSortable({
    id: column.id,
    data: { type: 'column' },   // <-- tipo para distinguir en BoardView
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  async function handleSaveName() {
    if (!columnName.trim()) { setColumnName(column.name); setEditingName(false); return }
    await supabase.from('columns').update({ name: columnName.trim() }).eq('id', column.id)
    setEditingName(false)
  }

  function handleAddCard() {
    if (!newCardTitle.trim()) return
    onAddCard(column.id, newCardTitle.trim())
    setNewCardTitle('')
    setAddingCard(false)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        suppressHydrationWarning
        className={`
          flex-shrink-0 w-72 flex flex-col rounded-2xl
          bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
          shadow-sm transition-all duration-150 max-h-full
          ${isOver ? 'ring-2 ring-[var(--color-brand)]/50 scale-[1.01]' : ''}
          ${isColumnDragging ? 'opacity-40' : ''}
        `}
      >
        {/* Column header */}
        <div className="px-3 pt-3 pb-2 flex items-center gap-1">

          {/* Grip handle — únicos listeners de drag de columna */}
          <button
            {...listeners}
            suppressHydrationWarning
            className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] transition-all flex-shrink-0 cursor-grab active:cursor-grabbing"
            title="Arrastrar lista"
            onClick={e => e.stopPropagation()}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm6-8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 4a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
            </svg>
          </button>

          {editingName ? (
            <input
              value={columnName}
              onChange={e => setColumnName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveName()
                if (e.key === 'Escape') { setColumnName(column.name); setEditingName(false) }
              }}
              autoFocus
              className="flex-1 px-2 py-1 text-sm font-semibold bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] border border-[var(--color-border)]"
            />
          ) : (
            <button
              className="flex-1 text-left px-2 py-1 font-semibold text-[var(--color-text-primary)] text-sm rounded-lg hover:bg-[var(--color-border)] transition-colors"
              onClick={() => setEditingName(true)}
              title="Clic para renombrar"
            >
              {columnName}
              <span className="ml-2 text-[var(--color-text-muted)] font-normal text-xs bg-[var(--color-border)] px-1.5 py-0.5 rounded-full">
                {cards.length}
              </span>
            </button>
          )}

          <button
            onClick={() => setConfirmDelete(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all flex-shrink-0"
            title="Eliminar lista"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cards area */}
        <div className="flex-1 column-scroll px-2 pb-2 space-y-2 min-h-[40px]">
          <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {cards.map(card => (
              <CardComponent
                key={card.id}
                card={card}
                labels={labels}
                onUpdate={onUpdateCard}
                onDelete={onDeleteCard}
              />
            ))}
          </SortableContext>
        </div>

        {/* Add card area */}
        <div className="px-2 pb-2 flex-shrink-0">
          {addingCard ? (
            <div className="bg-[var(--color-surface)] rounded-xl p-3 shadow-sm border border-[var(--color-border)] animate-scale-in">
              <textarea
                placeholder="Título de la tarea..."
                value={newCardTitle}
                onChange={e => setNewCardTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard() }
                  if (e.key === 'Escape') { setAddingCard(false); setNewCardTitle('') }
                }}
                autoFocus
                rows={2}
                className="w-full px-3 py-2 rounded-lg text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] placeholder-[var(--color-text-muted)] resize-none border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] transition-all"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddCard}
                  disabled={!newCardTitle.trim()}
                  className="bg-[var(--color-brand)] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50"
                >
                  Agregar
                </button>
                <button
                  onClick={() => { setAddingCard(false); setNewCardTitle('') }}
                  className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] text-xs px-2 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAddingCard(true)}
              className="w-full text-left text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Agregar tarea
            </button>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          title="¿Eliminar lista?"
          message={`Se eliminará "${columnName}" y todas sus tareas. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={() => { setConfirmDelete(false); onDeleteColumn(column.id) }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}