import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Gotita } from '../components/Gotita'
import { LloroInput } from '../components/LloroInput'
import { useAudioRecorder } from '../hooks/useAudioRecorder'

interface HomeViewProps {
  /** Se llama con el texto que el usuario quiere desahogar (escrito o nota de voz). */
  onSubmitDraft: (text: string) => void
}

export const HomeView: React.FC<HomeViewProps> = ({ onSubmitDraft }) => {
  const [inputText, setInputText] = useState('')
  const {
    isRecording,
    recordingTime,
    audioBlob,
    permissionError,
    startRecording,
    stopRecording,
    cancelRecording,
    resetAudio,
  } = useAudioRecorder()

  // Escuchar cuando finalice la grabación con un audioBlob válido
  useEffect(() => {
    if (audioBlob) {
      onSubmitDraft('🎤 Nota de voz')
      resetAudio()
    }
  }, [audioBlob, onSubmitDraft, resetAudio])

  const handleSendMessage = () => {
    const text = inputText.trim()
    if (!text) return
    onSubmitDraft(text)
    setInputText('')
  }

  return (
    <div
      role="main"
      className="relative h-full w-full min-h-[100dvh] bg-slate-50 dark:bg-[#0E131F] text-slate-900 dark:text-white flex flex-col justify-between selection:bg-[#4EA8DE]/30 select-none overflow-hidden transition-colors duration-200"
    >
      <div className="w-full max-w-md mx-auto h-full min-h-[100dvh] flex flex-col justify-between pt-12 pb-28 px-6">
        {/* Header de la aplicación */}
        <header className="text-center pt-2 select-none">
          <h1 className="font-['Quicksand',sans-serif] font-bold text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-wide">
            La Llorería
          </h1>
          <p className="font-['Lato',sans-serif] text-lg text-slate-500 dark:text-[#8E9CAE] mt-2 font-normal">
            Desahogate
          </p>
        </header>

        {/* Sección Central con Mascota Gotita */}
        <section className="flex-1 flex items-center justify-center py-6 select-none" aria-label="Mascota Gotita">
          <motion.div
            animate={{ y: [0, -10, 0], scale: [1, 1.015, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-center drop-shadow-[0_10px_25px_rgba(78,168,222,0.15)] will-change-transform"
          >
            <Gotita size={210} />
          </motion.div>
        </section>
      </div>

      {/* Footer con el campo de texto / acción anclado al fondo absoluto */}
      <footer
        className="absolute bottom-0 inset-x-0 w-full max-w-md mx-auto px-6 pb-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] z-20"
        onPointerDownCapture={(e) => e.stopPropagation()}
      >
        <LloroInput
          value={inputText}
          onChange={setInputText}
          onSubmit={handleSendMessage}
          placeholder="¿Qué pasó hoy?"
          isRecording={isRecording}
          recordingTime={recordingTime}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onCancelRecording={cancelRecording}
          permissionError={permissionError}
        />
      </footer>
    </div>
  )
}

export default HomeView
