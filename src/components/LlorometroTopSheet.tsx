import React, { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useDragControls } from 'framer-motion'
import * as Slider from '@radix-ui/react-slider'
import { LLOROMETRO_LEVELS } from '../lib/llorometro'

interface LlorometroTopSheetProps {
  isOpen: boolean
  onClose: () => void
  /** Se llama con el nivel elegido (1 a 10) al tocar "Soltar a la lluvia". */
  onRelease: (level: number) => void
  initialLevel?: number
}

const FOCUSABLE = 'button, [href], input, select, textarea, [role="slider"], [tabindex]:not([tabindex="-1"])'

export const LlorometroTopSheet: React.FC<LlorometroTopSheetProps> = ({
  isOpen,
  onClose,
  onRelease,
  initialLevel = 5,
}) => {
  const [level, setLevel] = useState(initialLevel)
  const sheetRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const dragControls = useDragControls()
  const titleId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  // Cada apertura arranca en el nivel inicial (se ajusta durante el render, sin efecto)
  const [wasOpen, setWasOpen] = useState(isOpen)
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen)
    if (isOpen) setLevel(initialLevel)
  }

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const focusTimer = window.setTimeout(
      () => sheetRef.current?.querySelector<HTMLElement>('[role="slider"]')?.focus(),
      50,
    )

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !sheetRef.current) return
      const items = Array.from(sheetRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const outside = !sheetRef.current.contains(active)
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
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus?.()
    }
  }, [isOpen])

  const current = LLOROMETRO_LEVELS[level - 1]
  const first = LLOROMETRO_LEVELS[0]
  const last = LLOROMETRO_LEVELS[LLOROMETRO_LEVELS.length - 1]

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-[#0E131F]/70 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          <div className="mx-auto w-full max-w-md">
            <motion.div
              ref={sheetRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative w-full rounded-b-[32px] border-x border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#161F33] text-slate-900 dark:text-white px-6 pb-[max(2.25rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] text-center shadow-2xl shadow-slate-900/20 dark:shadow-black/50 will-change-transform"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              drag="y"
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.5, bottom: 0.05 }}
              onDragEnd={(_, info) => {
                if (info.offset.y < -70 || info.velocity.y < -500) onClose()
              }}
              onClick={(e) => e.stopPropagation()}
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              <h2
                id={titleId}
                className="font-['Quicksand',sans-serif] text-[22px] font-bold text-slate-900 dark:text-white"
              >
                ¿Cuánto pesa tu lloro?
              </h2>

              <div className="mt-5 flex h-16 items-center justify-center" aria-hidden="true">
                <motion.span
                  key={level}
                  className="text-[56px] leading-none"
                  initial={{ scale: 0.7, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 300 }}
                >
                  {current.emoji}
                </motion.span>
              </div>

              <p
                className="mt-2 font-['Lato',sans-serif] text-sm text-slate-500 dark:text-[#8E9CAE]"
                aria-live="polite"
              >
                {current.label}
              </p>

              <Slider.Root
                className="relative mt-9 flex h-7 w-full touch-none select-none items-center"
                min={1}
                max={10}
                step={1}
                value={[level]}
                onValueChange={([v]) => setLevel(v)}
                onPointerDownCapture={(e) => e.stopPropagation()}
              >
                <Slider.Track className="relative h-1.5 grow overflow-hidden rounded-full bg-slate-200 dark:bg-[#0E131F]">
                  <Slider.Range className="absolute h-full rounded-full bg-[#4EA8DE]" />
                </Slider.Track>
                <Slider.Thumb
                  aria-label="Peso del lloro"
                  aria-valuetext={`${level} de 10: ${current.label}`}
                  className="relative block h-7 w-7 cursor-grab rounded-full bg-white shadow-[0_0_14px_rgba(78,168,222,0.7)] transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#161F33] active:cursor-grabbing"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 font-['Lato',sans-serif] text-base text-slate-900 dark:text-white"
                  >
                    {level}
                  </span>
                </Slider.Thumb>
              </Slider.Root>

              <div className="mt-2 flex justify-between font-['Lato',sans-serif] text-sm text-slate-500 dark:text-[#8E9CAE]">
                <span>
                  {first.level} <span aria-hidden="true">({first.emoji})</span>
                </span>
                <span>
                  {last.level} <span aria-hidden="true">({last.emoji})</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => onRelease(level)}
                className="mt-6 rounded-full bg-[#4EA8DE] px-10 py-3.5 font-['Quicksand',sans-serif] text-base font-bold uppercase tracking-wide text-[#0E131F] transition-all duration-150 hover:bg-[#3ba0de] active:scale-[0.96] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#161F33]"
              >
                Soltar a la lluvia
              </button>

              {/* Tirador: solo desde acá se arrastra la hoja hacia arriba para cerrarla */}
              <div
                className="absolute inset-x-0 bottom-0 flex h-8 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
                aria-hidden="true"
              >
                <span className="h-1 w-14 rounded-full bg-[#8E9CAE]/30" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export default LlorometroTopSheet


