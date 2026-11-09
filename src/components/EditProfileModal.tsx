import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  currentUsername: string
  onSave: (newName: string) => void
}

const MAX_LENGTH = 24
const FOCUSABLE = 'button:not(:disabled), input, [href], select, textarea, [tabindex]:not([tabindex="-1"])'

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUsername,
  onSave,
}) => {
  const [name, setName] = useState(currentUsername)
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()
  const inputId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Cada apertura parte del nombre actual (se ajusta durante el render, sin efecto)
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) setName(currentUsername)
  }

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    inputRef.current?.focus()
    inputRef.current?.select()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const outside = !dialogRef.current.contains(active)
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [isOpen])

  const trimmed = name.trim()
  const canSave = trimmed.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSave) return
    onSave(trimmed)
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0E131F]/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="bg-[#161F33] rounded-[32px] p-6 w-full max-w-sm border border-white/5 shadow-2xl shadow-black/40"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={titleId} className="font-['Quicksand',sans-serif] text-xl font-bold text-white">
              Editar Perfil
            </h2>

            <form onSubmit={handleSubmit} noValidate>
              <label
                htmlFor={inputId}
                className="mt-6 block font-['Lato',sans-serif] text-xs text-[#8E9CAE]"
              >
                Nombre de usuario
              </label>
              <input
                ref={inputRef}
                id={inputId}
                type="text"
                value={name}
                maxLength={MAX_LENGTH}
                onChange={(e) => setName(e.target.value)}
                autoComplete="nickname"
                className="mt-1 w-full border-b border-[#8E9CAE] bg-[#0E131F] px-3 py-2.5 font-['Lato',sans-serif] text-base text-white caret-[#4EA8DE] rounded-t-lg focus:border-[#4EA8DE] focus:outline-none transition-colors"
              />
              <p className="mt-1 text-right font-['Lato',sans-serif] text-[11px] text-[#8E9CAE]" aria-hidden="true">
                {name.length}/{MAX_LENGTH}
              </p>

              <button
                type="submit"
                disabled={!canSave}
                className="bg-[#4EA8DE] text-[#0E131F] rounded-full py-3 w-full font-['Quicksand',sans-serif] font-bold mt-6 transition-all hover:bg-[#3ba0de] active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#161F33]"
              >
                Guardar
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default EditProfileModal

