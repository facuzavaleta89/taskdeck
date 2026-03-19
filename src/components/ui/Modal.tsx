'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface ModalProps {
  children: React.ReactNode
  onClose: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'w-full sm:max-w-lg',
  lg: 'w-full sm:max-w-2xl',
}

export function Modal({ children, onClose, className, size = 'md' }: ModalProps) {
  const [mounted, setMounted] = useState(false)
  // Estabilizamos onClose en un ref para que el event listener del teclado
  // no se desuscriba/re-suscriba en cada render cuando el padre pasa una lambda anónima.
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    setMounted(true)
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, []) // dep array vacío: se registra una sola vez

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onCloseRef.current()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'bg-[var(--color-surface)] rounded-2xl shadow-2xl w-full my-12 animate-scale-in',
          sizeClasses[size],
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal onClose={onCancel} size="sm">
      <div className="p-6">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors',
              danger
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-[var(--color-brand)] hover:bg-[var(--color-brand-hover)]'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}
