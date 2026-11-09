import React, { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Share2 } from 'lucide-react'
import { Gotita } from './Gotita'

interface DiagnosticModalProps {
  isOpen: boolean
  onClose: () => void
  diagnosisText: string // ej. "Claramente el universo conspira contra vos..."
  onAcceptDestiny: () => void // Navega o interactúa con "ACEPTAR MI DESTINO"
  onShareDrama: () => void // Navega al flujo del Muro de los Lloros / Llorómetro
}

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  onClose,
  diagnosisText,
  onAcceptDestiny,
  onShareDrama,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)
  const labelId = useId()
  const textId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    primaryRef.current?.focus()

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

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [isOpen])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0E131F]/70 backdrop-blur-md"
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
            aria-labelledby={labelId}
            aria-describedby={textId}
            className="w-full max-w-sm bg-[#161F33] border border-white/5 rounded-[32px] p-6 md:p-8 flex flex-col items-center text-center shadow-2xl shadow-black/50 will-change-transform"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Gotita size={100} className="mb-6" />

            <h2
              id={labelId}
              className="font-['Lato',sans-serif] font-bold text-xs uppercase tracking-[0.25em] text-[#8E9CAE] mb-3"
            >
              Diagnóstico
            </h2>

            <p
              id={textId}
              className="font-['Quicksand',sans-serif] font-medium text-[16px] md:text-[17px] leading-relaxed text-white mb-8 max-w-[280px]"
            >
              {diagnosisText}
            </p>

            <button
              ref={primaryRef}
              type="button"
              onClick={onAcceptDestiny}
              aria-label="Aceptar mi destino"
              className="w-full py-4 rounded-full bg-[#4EA8DE] hover:bg-[#3ba0de] active:scale-[0.96] transition-all duration-150 font-['Quicksand',sans-serif] font-bold text-sm tracking-wide uppercase text-[#0E131F] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#161F33]"
            >
              Aceptar mi destino
            </button>

            <button
              type="button"
              onClick={onShareDrama}
              aria-label="Compartir drama"
              className="mt-5 inline-flex items-center gap-2 text-[#8E9CAE] hover:text-white transition-all duration-150 active:scale-[0.96] cursor-pointer rounded-full px-2 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]"
            >
              <span className="font-['Lato',sans-serif] text-sm">Compartir drama</span>
              <Share2 size={16} aria-hidden="true" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default DiagnosticModal

