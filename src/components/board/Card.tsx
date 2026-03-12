'use client'

import { useState } from 'react'
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
  const supabase = createClient()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const cardLabels: CardLabel[] = card.labels ?? []
  const isOverdue  = card.due_date && !card.completed && new Date(card.due_date) < new Date()
  
  const checklistItems = card.checklist_items ?? []
  const checklistTotal = checklistItems.length
  const checklistCompleted = checklistItems.filter(i => i.completed).length
  const checklistDone = checklistTotal > 0 && checklistCompleted === checklistTotal

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          'bg-[var(--color-surface)] rounded-xl shadow-sm p-3 border border-[var(--color-border)] cursor-grab active:cursor-grabbing',
          'hover:border-[var(--color-brand)]/50 hover:shadow-md transition-all duration-150',
          (isDragging || isSortableDragging) && 'opacity-40 scale-95',
          card.completed && 'opacity-60',
        )}
        onClick={() => !isSortableDragging && setModalOpen(true)}
      >
        {/* Label pills */}
        {cardLabels.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-2">
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

        {/* Checkbox + title row */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={card.completed}
            onChange={async e => {
              e.stopPropagation()
              const updated = { ...card, completed: e.target.checked }
              await supabase.from('cards').update({ completed: e.target.checked }).eq('id', card.id)
              onUpdate(updated)
            }}
            onClick={e => e.stopPropagation()}
            className="mt-0.5 w-4 h-4 rounded accent-[var(--color-brand)] cursor-pointer flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className={cn(
              'text-sm font-medium leading-tight block break-words',
              card.completed ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]',
            )}>
              {card.title}
            </span>

            {/* Description snippet */}
            {card.description && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2 leading-relaxed break-words">{card.description}</p>
            )}
          </div>
        </div>

        {/* Meta row */}
        {(checklistTotal > 0 || card.due_date) && (
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            {/* Checklist progress */}
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
                <span className={cn('text-xs font-medium flex-shrink-0', checklistDone ? 'text-emerald-600' : 'text-[var(--color-text-muted)]')}>
                  {checklistCompleted}/{checklistTotal}
                </span>
              </div>
            )}

            {/* Due date badge */}
            {card.due_date && (
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 flex items-center gap-1',
                isOverdue
                  ? 'bg-red-100 text-red-600'
                  : card.completed
                    ? 'bg-emerald-100 text-emerald-600'
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