'use client'

import { useState } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
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
  const [addingCard, setAddingCard]     = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [editingName, setEditingName]   = useState(false)
  const [columnName, setColumnName]     = useState(column.name)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const supabase = createClient()

  const { setNodeRef, isOver } = useDroppable({ id: column.id })

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
      <div className={`flex-shrink-0 w-full sm:w-96 md:w-72 bg-[var(--color-bg-secondary)] backdrop-blur-sm rounded-xl flex flex-col transition-all duration-150 shadow-sm border border-[var(--color-border)] ${isOver ? 'ring-2 ring-[var(--color-brand)]/40 scale-[1.01]' : ''}`}>
        {/* Column header */}
        <div className="px-3 pt-3 pb-2 flex items-center gap-1">
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
              className="flex-1 px-2 py-1 text-sm font-semibold bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)] border border-[var(--color-border)]"
            />
          ) : (
            <button
              className="flex-1 text-left px-2 py-1 font-semibold text-[var(--color-text-primary)] text-sm cursor-pointer hover:text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-border)] transition-colors group"
              onClick={() => setEditingName(true)}
              title="Clic para renombrar"
            >
              {columnName}
              <span className="ml-2 text-[var(--color-text-muted)] font-normal text-xs">{cards.length}</span>
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
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto column-scroll px-2 pb-2 space-y-2 min-h-[40px]"
        >
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
        <div className="px-2 pb-3 flex-shrink-0">
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
                className="w-full text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] placeholder-[var(--color-text-muted)] resize-none focus:outline-none overflow-hidden"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleAddCard}
                  disabled={!newCardTitle.trim()}
                  className="bg-[var(--color-brand)] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[var(--color-brand-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Confirm delete dialog */}
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