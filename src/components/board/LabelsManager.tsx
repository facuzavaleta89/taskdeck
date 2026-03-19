'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Label } from '@/types'
import { Modal, ConfirmModal } from '@/components/ui/Modal'

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
]

interface Props {
  boardId: string
  initialLabels: Label[]
  onLabelsChange: (labels: Label[]) => void
}

// ColorPicker definido top-level para evitar desmontajes/remontajes en cada render del padre
interface ColorPickerProps {
  selectedColor: string
  onChange: (color: string) => void
  usedColors: string[]
}

function ColorPicker({ selectedColor, onChange, usedColors }: ColorPickerProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {PRESET_COLORS.map(c => {
        const isUsed     = usedColors.includes(c)
        const isSelected = selectedColor === c
        return (
          <button
            key={c}
            onClick={() => !isUsed && onChange(c)}
            disabled={isUsed}
            className={`w-7 h-7 rounded-lg transition-all relative ${
              isUsed ? 'opacity-25 cursor-not-allowed' : 'hover:scale-110'
            }`}
            style={{
              backgroundColor: c,
              outline: isSelected ? '2px solid var(--color-brand)' : 'none',
              outlineOffset: '2px',
            }}
            title={isUsed ? 'Color ya en uso' : undefined}
          >
            {isUsed && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default function LabelsManager({ boardId, initialLabels, onLabelsChange }: Props) {
  const [open, setOpen]         = useState(false)
  const [labels, setLabels]     = useState<Label[]>(initialLabels)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName]   = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName]   = useState('')
  const [editColor, setEditColor] = useState('')

  const [confirmDelete, setConfirmDelete] = useState<Label | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    setLabels(initialLabels)
  }, [initialLabels])

  const usedColors       = labels.filter(l => l.id !== editingId).map(l => l.color)
  const usedColorsForNew = labels.map(l => l.color)

  async function handleCreate() {
    if (!newName.trim()) return
    const { data } = await supabase.from('labels').insert({
      name: newName.trim(),
      color: newColor,
      board_id: boardId,
    }).select().single()

    if (data) {
      const updated = [...labels, data]
      setLabels(updated)
      onLabelsChange(updated)
      setNewName('')
      const nextColor = PRESET_COLORS.find(c => !updated.map(l => l.color).includes(c)) ?? PRESET_COLORS[0]
      setNewColor(nextColor)
      setCreating(false)
      setOpen(false)
      // router.refresh() eliminado: onLabelsChange ya sincroniza el estado local
    }
  }

  async function handleSaveEdit(id: string) {
    await supabase.from('labels').update({ name: editName, color: editColor }).eq('id', id)
    const updated = labels.map(l => l.id === id ? { ...l, name: editName, color: editColor } : l)
    setLabels(updated)
    onLabelsChange(updated)
    setEditingId(null)
    setOpen(false)
    // router.refresh() eliminado: onLabelsChange ya sincroniza el estado local
  }

  async function handleDelete(label: Label) {
    await supabase.from('labels').delete().eq('id', label.id)
    const updated = labels.filter(l => l.id !== label.id)
    setLabels(updated)
    onLabelsChange(updated)
    setConfirmDelete(null)
    setOpen(false)
    // router.refresh() eliminado: onLabelsChange ya sincroniza el estado local
  }

  function startEdit(label: Label) {
    setEditingId(label.id)
    setEditName(label.name ?? '')
    setEditColor(label.color)
  }

  function handleOpen() {
    const nextColor = PRESET_COLORS.find(c => !labels.map(l => l.color).includes(c)) ?? PRESET_COLORS[0]
    setNewColor(nextColor)
    setOpen(true)
  }

  return (
    <>
      {/* Botón con preview de etiquetas */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-white text-sm font-medium">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <span>Etiquetas</span>
          {labels.length > 0 && (
            <div className="flex items-center gap-1.5 ml-1">
              {labels.map(label => (
                <span
                  key={label.id}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs font-medium cursor-pointer hover:brightness-90 transition-all"
                  style={{ backgroundColor: label.color }}
                  onClick={handleOpen}
                  title="Gestionar etiquetas"
                >
                  {label.name || ''}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleOpen}
          className="bg-black/20 hover:bg-black/30 text-white w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
          title="Gestionar etiquetas"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {open && (
        <Modal onClose={() => { setOpen(false); setCreating(false) }} size="sm">
          <div className="p-6">

            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Etiquetas del tablero</h3>
              <button
                onClick={() => { setOpen(false); setCreating(false) }}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {labels.length === 0 && (
                <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No hay etiquetas todavía.</p>
              )}
              {labels.map(label => (
                <div key={label.id}>
                  {editingId === label.id ? (
                    <div className="border border-[var(--color-border)] rounded-xl p-4 space-y-3 bg-[var(--color-bg-secondary)]">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveEdit(label.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        autoFocus
                        className="w-full px-3 py-2 text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] placeholder-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                      />
                      <ColorPicker
                        selectedColor={editColor}
                        onChange={setEditColor}
                        usedColors={usedColors}
                      />
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => setConfirmDelete(label)}
                          className="text-[var(--color-text-muted)] hover:text-red-500 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-1.5 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleSaveEdit(label.id)}
                            className="bg-[var(--color-brand)] text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-[var(--color-brand-hover)] transition-colors"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 group">
                      <div
                        className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors border border-transparent hover:border-[var(--color-border)]"
                        onClick={() => startEdit(label)}
                      >
                        <span className="w-10 h-6 rounded-lg flex-shrink-0" style={{ backgroundColor: label.color }} />
                        <span className="text-sm text-[var(--color-text-primary)]">
                          {label.name || <span className="text-[var(--color-text-muted)] italic">Sin nombre</span>}
                        </span>
                      </div>
                      <button
                        onClick={() => setConfirmDelete(label)}
                        className="text-[var(--color-text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {creating ? (
              <div className="border border-[var(--color-border)] rounded-xl p-4 space-y-3 bg-[var(--color-bg-secondary)] animate-scale-in">
                <input
                  type="text"
                  placeholder="Nombre de la etiqueta"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreate()
                    if (e.key === 'Escape') setCreating(false)
                  }}
                  autoFocus
                  className="w-full px-3 py-2 text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] placeholder-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                />
                <ColorPicker
                  selectedColor={newColor}
                  onChange={setNewColor}
                  usedColors={usedColorsForNew}
                />
                <div className="flex items-center gap-2 px-1">
                  <div className="w-10 h-6 rounded-lg flex-shrink-0" style={{ backgroundColor: newColor }} />
                  <span className="text-sm text-[var(--color-text-primary)]">
                    {newName || <span className="text-[var(--color-text-muted)] italic">Vista previa</span>}
                  </span>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => { setCreating(false); setNewName('') }}
                    className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-1.5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim()}
                    className="bg-[var(--color-brand)] text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-[var(--color-brand-hover)] disabled:opacity-50 transition-colors"
                  >
                    Crear
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                disabled={labels.length >= PRESET_COLORS.length}
                className="w-full border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                {labels.length >= PRESET_COLORS.length ? 'Máximo de etiquetas alcanzado' : 'Nueva etiqueta'}
              </button>
            )}
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="¿Eliminar etiqueta?"
          message={`Se eliminará "${confirmDelete.name || 'Sin nombre'}" y se quitará de todas las tareas.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}