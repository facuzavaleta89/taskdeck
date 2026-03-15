'use client'

import { useState } from 'react'
import type { Card, CardLabel, Label, ChecklistItem } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Modal, ConfirmModal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'

interface Props {
  card: Card
  labels: Label[]
  onUpdate: (card: Card) => void
  onDelete: (cardId: string) => void
  onClose: () => void
}

export default function CardModal({ card, labels, onUpdate, onDelete, onClose }: Props) {
  const [title, setTitle]             = useState(card.title)
  const [description, setDescription] = useState(card.description ?? '')
  const [dueDate, setDueDate]         = useState(card.due_date ?? '')
  const [saving, setSaving]           = useState(false)
  const [activeLabels, setActiveLabels] = useState<CardLabel[]>(card.labels ?? [])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(
    (card.checklist_items ?? []).sort((a, b) => a.position - b.position)
  )
  const [newItemText, setNewItemText] = useState('')
  const [addingItem, setAddingItem]   = useState(false)
  const supabase = createClient()

  const completedCount = checklistItems.filter(i => i.completed).length
  const progress = checklistItems.length > 0
    ? Math.round((completedCount / checklistItems.length) * 100)
    : 0

  async function handleToggleItem(item: ChecklistItem) {
    const updated = { ...item, completed: !item.completed }
    await supabase.from('checklist_items').update({ completed: updated.completed }).eq('id', item.id)
    const newItems = checklistItems.map(i => i.id === item.id ? updated : i)
    setChecklistItems(newItems)
    onUpdate({ ...card, checklist_items: newItems })
  }

  async function handleAddItem() {
    if (!newItemText.trim()) return
    const position = (checklistItems.length + 1) * 1000
    const { data } = await supabase.from('checklist_items').insert({
      card_id: card.id,
      text: newItemText.trim(),
      position,
    }).select().single()
    if (data) {
      const newItems = [...checklistItems, data]
      setChecklistItems(newItems)
      onUpdate({ ...card, checklist_items: newItems })
      setNewItemText('')
    }
  }

  async function handleDeleteItem(itemId: string) {
    await supabase.from('checklist_items').delete().eq('id', itemId)
    const newItems = checklistItems.filter(i => i.id !== itemId)
    setChecklistItems(newItems)
    onUpdate({ ...card, checklist_items: newItems })
  }

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)

    // Guardar campos de la card
    await supabase.from('cards').update({
      title:       title.trim(),
      description: description || null,
      due_date:    dueDate || null,
    }).eq('id', card.id)

    // Sincronizar etiquetas: comparar estado actual vs original
    const originalLabelIds = (card.labels ?? []).map(cl => cl.label_id)
    const activeLabelIds   = activeLabels.map(cl => cl.label_id)

    const toDelete = originalLabelIds.filter(id => !activeLabelIds.includes(id))
    const toInsert = activeLabelIds.filter(id => !originalLabelIds.includes(id))

    await Promise.all([
      ...toDelete.map(labelId =>
        supabase.from('card_labels').delete().eq('card_id', card.id).eq('label_id', labelId)
      ),
      ...toInsert.map(labelId =>
        supabase.from('card_labels').insert({ card_id: card.id, label_id: labelId })
      ),
    ])

    const updated = {
      ...card,
      title:       title.trim(),
      description: description || null,
      due_date:    dueDate || null,
      labels:      activeLabels,
    }
    onUpdate(updated)
    setSaving(false)
    onClose()
  }

  function handleToggleLabel(labelId: string) {
    const hasLabel = activeLabels.some(cl => cl.label_id === labelId)
    if (hasLabel) {
      setActiveLabels(prev => prev.filter(cl => cl.label_id !== labelId))
    } else {
      const label = labels.find(l => l.id === labelId) ?? null
      setActiveLabels(prev => [...prev, { label_id: labelId, labels: label }])
    }
  }

  return (
    <>
      <Modal onClose={onClose} size="md">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Title */}
          <div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              className="w-full text-lg font-bold text-[var(--color-text-primary)] bg-transparent focus:outline-none border-b-2 border-transparent focus:border-blue-400 pb-1 placeholder-[var(--color-text-muted)] transition-colors"
              placeholder="Título de la tarea"
            />
          </div>

          {/* Description */}
          <Field label="Descripción">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Agregar una descripción..."
              rows={3}
              className="w-full text-sm text-[var(--color-text-primary)] bg-[var(--color-bg-secondary)] placeholder-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-colors"
            />
          </Field>

          {/* Due date */}
          <Field label="Fecha de vencimiento">
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            />
            {dueDate && (
              <button
                onClick={() => setDueDate('')}
                className="text-xs text-[var(--color-text-muted)] hover:text-red-400 transition-colors ml-2"
              >
                Quitar
              </button>
            )}
          </Field>

          {/* Labels */}
          {labels.length > 0 && (
            <Field label="Etiquetas">
              <div className="flex gap-2 flex-wrap">
                {labels.map(label => {
                  const isActive = activeLabels.some(cl => cl.label_id === label.id)
                  return (
                    <button
                      key={label.id}
                      onClick={() => handleToggleLabel(label.id)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium text-white transition-all',
                        isActive ? 'shadow-md scale-105' : 'opacity-40 hover:opacity-70',
                      )}
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name ?? label.color}
                    </button>
                  )
                })}
              </div>

            </Field>
          )}

          {/* Checklist */}
          <Field
            label={`Checklist${checklistItems.length > 0 ? ` (${completedCount}/${checklistItems.length})` : ''}`}
            action={
              !addingItem && (
                <button
                  onClick={() => setAddingItem(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  + Agregar ítem
                </button>
              )
            }
          >
            {/* Progress bar */}
            {checklistItems.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-[var(--color-text-muted)] w-8 text-right">{progress}%</span>
                <div className="flex-1 bg-[var(--color-bg-secondary)] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%`, backgroundColor: progress === 100 ? '#22c55e' : '#3b82f6' }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="space-y-1">
              {checklistItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 group py-1 px-1 rounded-lg hover:bg-[var(--color-bg-secondary)] transition-colors">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleItem(item)}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0"
                  />
                  <span className={cn('text-sm flex-1', item.completed ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]')}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="w-6 h-6 flex items-center justify-center rounded text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Add item form */}
            {addingItem && (
              <div className="mt-2 animate-scale-in">
                <input
                  type="text"
                  placeholder="Nuevo ítem..."
                  value={newItemText}
                  onChange={e => setNewItemText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleAddItem()
                    if (e.key === 'Escape') { setAddingItem(false); setNewItemText('') }
                  }}
                  autoFocus
                  className="w-full text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] placeholder-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddItem}
                    disabled={!newItemText.trim()}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Agregar
                  </button>
                  <button
                    onClick={() => { setAddingItem(false); setNewItemText('') }}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-xs px-2 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </Field>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 sm:px-6 sm:pb-6 flex items-center justify-between border-t border-[var(--color-border)] pt-4 gap-2 flex-wrap">
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-[var(--color-text-muted)] hover:text-red-500 text-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>

      {confirmDelete && (
        <ConfirmModal
          title="¿Eliminar tarea?"
          message={`Se eliminará "${card.title}" permanentemente. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={() => { onDelete(card.id); onClose() }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  )
}

// Helper sub-component
function Field({ label, children, action }: { label: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">{label}</label>
        {action}
      </div>
      {children}
    </div>
  )
}