import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gotita } from './Gotita'

interface ThinkingStateProps {
  isVisible: boolean
  message?: string
  /** `true` (por defecto) cubre la pantalla; `false` se renderiza en línea. */
  overlay?: boolean
}

export const ThinkingState: React.FC<ThinkingStateProps> = ({
  isVisible,
  message = 'Analizando tu nivel de drama...',
  overlay = true,
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        role="status"
        aria-live="polite"
        className={
          overlay
            ? 'fixed inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-slate-900/60 dark:bg-[#0E131F]/70 backdrop-blur-md'
            : 'flex flex-col items-center justify-center gap-4'
        }
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Gotita size={80} />
        </motion.div>
        <p className="animate-pulse text-center font-['Lato',sans-serif] text-sm text-slate-600 dark:text-[#8E9CAE]">
          {message}
        </p>
      </motion.div>
    )}
  </AnimatePresence>
)

export default ThinkingState


