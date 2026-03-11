'use client'

import { useState } from 'react'
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

export default function LabelsManager({ boardId, initialLabels, onLabelsChange }: Props) {
  const [open, setOpen] = useState(false)
  const [labels, setLabels] = useState<Label[]>(initialLabels)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editColor, setEditColor] = useState('')
  
  const [confirmDelete, setConfirmDelete] = useState<Label | null>(null)
  const supabase = createClient()

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
      setNewColor(PRESET_COLORS[0])
      setCreating(false)
    }
  }

  async function handleSaveEdit(id: string) {
    await supabase.from('labels').update({ name: editName, color: editColor }).eq('id', id)
    const updated = labels.map(l => l.id === id ? { ...l, name: editName, color: editColor } : l)
    setLabels(updated)
    onLabelsChange(updated)
    setEditingId(null)
  }

  async function handleDelete(label: Label) {
    await supabase.from('labels').delete().eq('id', label.id)
    const updated = labels.filter(l => l.id !== label.id)
    setLabels(updated)
    onLabelsChange(updated)
    setConfirmDelete(null)
  }

  function startEdit(label: Label) {
    setEditingId(label.id)
    setEditName(label.name ?? '')
    setEditColor(label.color)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-black/20 hover:bg-black/30 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        Etiquetas
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)} size="sm">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-5">Etiquetas del tablero</h3>

            <div className="space-y-2 mb-4">
              {labels.length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">No hay etiquetas todavía.</p>
              )}
              {labels.map(label => (
                <div key={label.id}>
                  {editingId === label.id ? (
                    <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(label.id); if (e.key === 'Escape') setEditingId(null) }}
                        autoFocus
                        className="w-full px-3 py-2 text-sm text-slate-800 bg-white placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                      />
                      <div className="flex gap-2 flex-wrap">
                        {PRESET_COLORS.map(c => (
                          <button
                            key={c}
                            onClick={() => setEditColor(c)}
                            className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                            style={{
                              backgroundColor: c,
                              outline: editColor === c ? '2px solid #1d4ed8' : 'none',
                              outlineOffset: '2px'
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <button
                          onClick={() => setConfirmDelete(label)}
                          className="text-slate-400 hover:text-red-500 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingId(null)} className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 transition-colors">Cancelar</button>
                          <button
                            onClick={() => handleSaveEdit(label.id)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 group">
                      <div
                        className="flex-1 flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                        onClick={() => startEdit(label)}
                      >
                        <span className="w-10 h-6 rounded-lg flex-shrink-0" style={{ backgroundColor: label.color }} />
                        <span className="text-sm text-slate-700">{label.name || <span className="text-slate-400 italic">Sin nombre</span>}</span>
                      </div>
                      <button
                        onClick={() => setConfirmDelete(label)}
                        className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50"
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
              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-slate-50 animate-scale-in">
                <input
                  type="text"
                  placeholder="Nombre de la etiqueta"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
                  autoFocus
                  className="w-full px-3 py-2 text-sm text-slate-800 bg-white placeholder-slate-400 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewColor(c)}
                      className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                      style={{
                        backgroundColor: c,
                        outline: newColor === c ? '2px solid #1d4ed8' : 'none',
                        outlineOffset: '2px'
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 px-1">
                  <div className="w-10 h-6 rounded-lg flex-shrink-0" style={{ backgroundColor: newColor }} />
                  <span className="text-sm text-slate-600">{newName || <span className="text-slate-400 italic">Vista previa</span>}</span>
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <button onClick={() => { setCreating(false); setNewName('') }} className="text-sm text-slate-500 hover:text-slate-700 px-3 py-1.5 transition-colors">Cancelar</button>
                  <button
                    onClick={handleCreate}
                    disabled={!newName.trim()}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    Crear
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="w-full border-2 border-dashed border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 hover:bg-slate-50 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Nueva etiqueta
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <ConfirmModal
          title="¿Eliminar etiqueta?"
          message={`Se eliminará "${confirmDelete.name || 'Sin nombre'}" y se quitará de todas las tareas. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  )
}