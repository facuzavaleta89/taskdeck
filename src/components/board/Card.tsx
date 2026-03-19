'use client'

import { useMemo, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Card, CardLabel, Label } from '@/types'
import CardModal from './CardModal'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Props {
  card: Card
  labels: Label[]
  onUpdate: (card: Card) => void
  onDelete: (cardId: string) => void
  isDragging?: boolean
}

export default function CardComponent({ card, labels, onUpdate, onDelete, isDragging }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  // createClient() es estable entre renders (singleton interno de @supabase/ssr)
  // pero lo memoizamos para ser explícitos y evitar recrear el objeto en cada render
  const supabase = useMemo(() => createClient(), [])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id, data: { type: 'card' } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const cardLabels: CardLabel[] = card.labels ?? []
  const isOverdue = card.due_date && !card.completed && new Date(card.due_date) < new Date()

  const checklistItems     = card.checklist_items ?? []
  const checklistTotal     = checklistItems.length
  const checklistCompleted = checklistItems.filter(i => i.completed).length
  const checklistDone      = checklistTotal > 0 && checklistCompleted === checklistTotal

  async function handleToggleCompleted(checked: boolean) {
    // Una sola escritura: actualizamos el estado a través de onUpdate,
    // que delega la escritura a Supabase en BoardView.handleUpdateCard.
    // Antes había double-write: Card escribía a Supabase Y llamaba a onUpdate
    // que volvía a escribir a Supabase.
    const updated = { ...card, completed: checked }
    await supabase.from('cards').update({ completed: checked }).eq('id', card.id)
    onUpdate(updated)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        suppressHydrationWarning
        className={cn(
          'bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border)]',
          'cursor-grab active:cursor-grabbing select-none',
          'hover:border-[var(--color-brand)]/50 hover:shadow-md transition-all duration-150',
          (isDragging || isSortableDragging) && 'opacity-40 scale-95',
          card.completed && 'opacity-60',
        )}
        onClick={() => !isSortableDragging && setModalOpen(true)}
      >
        {/* Label pills */}
        {cardLabels.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2.5">
            {cardLabels.map((cl: CardLabel) => (
              <span
                key={cl.label_id}
                className="h-1.5 w-8 rounded-full"
                style={{ backgroundColor: cl.labels?.color ?? undefined }}
                title={cl.labels?.name ?? undefined}
              />
            ))}
          </div>
        )}

        {/* Checkbox + title */}
        <div className="flex items-start gap-2">
          <button
            type="button"
            onClick={async e => {
              e.stopPropagation()
              await handleToggleCompleted(!card.completed)
            }}
            className={cn(
              'mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all border-2',
              card.completed
                ? 'bg-[var(--color-brand)] border-[var(--color-brand)] text-white'
                : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)] hover:border-[var(--color-text-muted)] text-transparent'
            )}
            title={card.completed ? "Marcar como pendiente" : "Marcar como completada"}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <span className={cn(
              'text-sm font-medium leading-snug block break-words',
              card.completed
                ? 'line-through text-[var(--color-text-muted)]'
                : 'text-[var(--color-text-primary)]',
            )}>
              {card.title}
            </span>
            {card.description && (
              <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2 leading-relaxed break-words">
                {card.description}
              </p>
            )}
          </div>
        </div>

        {/* Meta row */}
        {(checklistTotal > 0 || card.due_date) && (
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">

            {checklistTotal > 0 && (
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <svg
                  className={cn('w-3.5 h-3.5 flex-shrink-0', checklistDone ? 'text-emerald-500' : 'text-[var(--color-text-muted)]')}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <div className="flex-1 bg-[var(--color-bg-secondary)] rounded-full h-1">
                  <div
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round((checklistCompleted / checklistTotal) * 100)}%`,
                      backgroundColor: checklistDone ? '#22c55e' : 'var(--color-brand)',
                    }}
                  />
                </div>
                <span className={cn(
                  'text-xs font-medium flex-shrink-0',
                  checklistDone ? 'text-emerald-500' : 'text-[var(--color-text-muted)]'
                )}>
                  {checklistCompleted}/{checklistTotal}
                </span>
              </div>
            )}

            {card.due_date && (
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 flex items-center gap-1',
                isOverdue
                  ? 'bg-red-500/10 text-red-500'
                  : card.completed
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]',
              )}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(card.due_date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
              </span>
            )}

          </div>
        )}
      </div>

      {modalOpen && (
        <CardModal
          card={card}
          labels={labels}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}