import React, { useEffect, useId, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Share } from 'lucide-react'
import { Gotita } from './Gotita'

interface DiagnosticModalProps {
  isOpen: boolean
  diagnosisText: string
  onAcceptDestiny: () => void // Lleva a la conversación privada con Gotita
  onShareDrama: () => void // Dispara el flujo del Llorómetro / Muro
  onClose?: () => void
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  diagnosisText,
  onAcceptDestiny,
  onShareDrama,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const textId = useId()

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    primaryRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return

      const items = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-[#0E131F]/80 backdrop-blur-sm"
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
            aria-describedby={textId}
            className="w-full max-w-md bg-[#161F33] border border-white/5 rounded-[32px] px-6 pt-8 pb-6 flex flex-col items-center text-center shadow-2xl shadow-black/40"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Gotita size={96} className="mb-6" />

            <h2
              id={titleId}
              className="font-['Lato',sans-serif] font-bold text-sm uppercase tracking-[0.2em] text-[#8E9CAE]"
            >
              Diagnóstico
            </h2>

            <p
              id={textId}
              className="font-['Quicksand',sans-serif] font-semibold text-xl leading-snug text-white mt-3 mb-8"
            >
              {diagnosisText}
            </p>

            <button
              ref={primaryRef}
              type="button"
              onClick={onAcceptDestiny}
              aria-label="Aceptar mi destino"
              className="w-full rounded-full bg-[#4EA8DE] py-3.5 px-6 font-['Quicksand',sans-serif] font-bold text-base uppercase text-[#0E131F] transition-all duration-200 hover:brightness-110 active:scale-[0.98] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#161F33]"
            >
              Aceptar mi destino
            </button>

            <button
              type="button"
              onClick={onShareDrama}
              aria-label="Compartir drama"
              className="mt-5 inline-flex items-center gap-1.5 font-['Lato',sans-serif] text-base text-[#8E9CAE] transition-colors duration-200 hover:text-[#4EA8DE] cursor-pointer rounded-full px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]"
            >
              Compartir drama
              <Share className="w-4 h-4" aria-hidden="true" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DiagnosticModal

