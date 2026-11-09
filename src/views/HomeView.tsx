import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import { Gotita } from '../components/Gotita'
import { LloroInput } from '../components/LloroInput'
import { DiagnosticModal } from '../components/DiagnosticModal'

interface HomeViewProps {
  /** Navega al chat privado con Gotita, enviando el desahogo original y el diagnóstico. */
  onAcceptDestiny: (userMessage: string, diagnosis: string) => void
  onOpenProfile?: () => void
  /** Lleva al Muro de los Lloros. Si no se pasa, se comparte el texto con la API nativa. */
  onShareDrama?: (userMessage: string) => void
}

  export const HomeView: React.FC<HomeViewProps> = ({ onAcceptDestiny, onOpenProfile, onShareDrama }) => {
    const [inputText, setInputText] = useState('')
    const [diagnosis, setDiagnosis] = useState<string | null>(null)
    const [lastMessage, setLastMessage] = useState('')

    const handleSendMessage = () => {
      if (!inputText.trim()) return
      console.log('Mensaje enviado:', inputText)
      // TODO: reemplazar por el diagnóstico real del backend
      setLastMessage(inputText.trim())
      setDiagnosis('Claramente el universo conspira contra vos. O tal vez simplemente necesitás dormir ocho horas y tomar agua. Es un 50/50.')
      setInputText('')
    }

    // TODO: reemplazar por el flujo del Llorómetro / Muro cuando esté definido
    const handleShareDrama = async () => {
      if (!diagnosis) return
      if (onShareDrama) {
        setDiagnosis(null)
        onShareDrama(lastMessage)
        return
      }
      const text = `Mi diagnóstico en La Llorería: «${diagnosis}»`
      try {
        if (navigator.share) {
          await navigator.share({ title: 'La Llorería', text })
        } else {
          await navigator.clipboard.writeText(text)
        }
      } catch {
        // El usuario canceló el diálogo de compartir o el portapapeles no está disponible
      }
    }

    const handleVoiceRecord = (audio: Blob) => {
      console.log('Audio grabado:', audio.type, audio.size)
      // TODO: enviar el audio al backend para transcribir y diagnosticar
      setLastMessage('🎤 Nota de voz')
      setDiagnosis('Claramente el universo conspira contra vos. O tal vez simplemente necesitás dormir ocho horas y tomar agua. Es un 50/50.')
    }

    return (
      <main className="min-h-[100dvh] w-full bg-[#0E131F] flex flex-col justify-between selection:bg-[#4EA8DE]/30 selection:text-white">
        <div className="w-full max-w-md mx-auto min-h-[100dvh] flex flex-col justify-between py-12 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {/* Header de la aplicación */}
          <header className="relative text-center pt-2">
            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                aria-label="Abrir perfil"
                className="absolute right-0 top-2 p-1 rounded-full text-[#8E9CAE] hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]"
              >
                <User size={24} aria-hidden="true" />
              </button>
            )}
            <h1 className="font-['Quicksand',sans-serif] font-bold text-3xl sm:text-4xl text-white tracking-wide">
              La Llorería
            </h1>
            <p className="font-['Lato',sans-serif] text-lg text-[#8E9CAE] mt-2 font-normal">
              Desahogate
            </p>
          </header>

          {/* Sección Central con Mascota Gotita */}
          <section
            className="flex-1 flex items-center justify-center py-6"
            aria-label="Mascota Gotita"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                scale: [1, 1.015, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex items-center justify-center drop-shadow-[0_10px_25px_rgba(78,168,222,0.15)]"
            >
              <Gotita size={210} />
            </motion.div>
          </section>

          {/* Footer con el campo de texto / acción */}
          <footer className="w-full pt-2">
            <LloroInput
              value={inputText}
              onChange={setInputText}
              onSubmit={handleSendMessage}
              onVoiceRecord={handleVoiceRecord}
              placeholder="¿Qué pasó hoy?"
            />
          </footer>
        </div>
        <DiagnosticModal
          isOpen={diagnosis !== null}
          diagnosisText={diagnosis ?? ''}
          onAcceptDestiny={() => {
            if (diagnosis) onAcceptDestiny(lastMessage, diagnosis)
            setDiagnosis(null)
          }}
          onShareDrama={handleShareDrama}
          onClose={() => setDiagnosis(null)}
        />
      </main>
    )
  }

  export default HomeView








