import React, { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Gotita } from '../components/Gotita'
import { LloroInput } from '../components/LloroInput'
import { useAudioRecorder } from '../hooks/useAudioRecorder'

export interface ChatMessage {
  id: string
  sender: 'gotita' | 'user'
  text: string
}

interface ChatViewProps {
  onBack: () => void // Navegación hacia atrás (Home o Muro)
  messages: ChatMessage[] // Historial de mensajes
  onSendMessage: (text: string) => void
  onVoiceRecord?: () => void
  onSubmitDraft?: (text: string) => void
}

export const ChatView: React.FC<ChatViewProps> = ({
  onBack,
  messages,
  onSendMessage,
  onVoiceRecord,
  onSubmitDraft,
}) => {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

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

  // Desplazamiento suave al cargar y al recibir nuevos mensajes
  useEffect(() => {
    const el = scrollRef.current
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Cuando se obtiene un audioBlob válido, dispara el flujo de diagnóstico simulado o envío
  useEffect(() => {
    if (audioBlob) {
      if (onSubmitDraft) {
        onSubmitDraft('🎤 Nota de voz')
      } else {
        onSendMessage('🎤 Nota de voz')
      }
      resetAudio()
    }
  }, [audioBlob, onSubmitDraft, onSendMessage, resetAudio])

  const handleSendMessage = () => {
    const text = draft.trim()
    if (!text) return
    onSendMessage(text)
    setDraft('')
  }

  const handleStartRecording = () => {
    onVoiceRecord?.()
    startRecording()
  }

  return (
    <div
      role="main"
      className="relative h-full w-full min-h-[100dvh] bg-slate-50 dark:bg-[#0E131F] text-slate-900 dark:text-white select-none overflow-hidden transition-colors duration-200"
    >
      <div className="w-full max-w-md mx-auto h-full flex flex-col justify-between">
        {/* Top bar */}
        <header className="flex items-center justify-between py-4 px-6 border-b border-slate-200 dark:border-[#161F33] select-none pt-[max(1rem,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="text-slate-500 dark:text-[#8E9CAE] hover:text-slate-900 dark:hover:text-white transition-all duration-150 active:scale-[0.96] cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]"
          >
            <ArrowLeft size={24} aria-hidden="true" />
          </button>

          <div className="flex flex-col items-center text-center">
            <h1 className="font-['Quicksand',sans-serif] font-bold text-lg text-slate-900 dark:text-white">La Gotita</h1>
            <p className="font-['Lato',sans-serif] text-xs text-slate-500 dark:text-[#8E9CAE] inline-flex items-center gap-1.5">
              Escuchando desganado...
              <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-[#8E9CAE]/60 inline-block" aria-hidden="true" />
            </p>
          </div>

          {/* Espaciador del mismo ancho que la flecha para centrar el título */}
          <span className="w-6" aria-hidden="true" />
        </header>

        {/* Mensajes con scroll vertical y bloqueo de propagación para no arrastrar la pantalla */}
        <div
          ref={scrollRef}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className="no-scrollbar flex-1 overflow-y-auto px-6 pt-4 pb-28"
        >
          <ul className="space-y-4" aria-live="polite" aria-label="Conversación con La Gotita">
            {messages.map((m, i) => {
              const startsRun = messages[i - 1]?.sender !== m.sender

              if (m.sender === 'gotita') {
                return (
                  <li key={m.id} className="flex items-start gap-2.5 max-w-[85%]">
                    <Gotita size={26} className="flex-shrink-0 mt-1" />
                    <p
                      className={`selectable bg-white dark:bg-[#161F33] border border-slate-200/80 dark:border-transparent rounded-2xl ${startsRun ? 'rounded-tl-none' : ''
                        } p-4 text-slate-900 dark:text-white text-[15px] leading-relaxed font-['Quicksand',sans-serif] shadow-sm dark:shadow-none select-text`}
                    >
                      {m.text}
                    </p>
                  </li>
                )
              }

              return (
                <li key={m.id} className="flex flex-col items-end max-w-[85%] ml-auto">
                  <p
                    className={`selectable bg-slate-200 dark:bg-[#20293A] rounded-2xl ${startsRun ? 'rounded-tr-none' : ''
                      } p-4 text-slate-900 dark:text-white text-[15px] leading-relaxed font-['Quicksand',sans-serif] select-text`}
                  >
                    {m.text}
                  </p>
                  <span className="text-[11px] text-slate-400 dark:text-[#8E9CAE]/70 mt-1 mr-1 font-['Lato',sans-serif]">
                    Visto
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Footer con el campo de texto anclado al fondo absoluto */}
        <footer
          className="absolute bottom-0 inset-x-0 w-full max-w-md mx-auto px-6 pb-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-[#0E131F] dark:via-[#0E131F] dark:to-transparent z-20"
          onPointerDownCapture={(e) => e.stopPropagation()}
        >
          <LloroInput
            value={draft}
            onChange={setDraft}
            onSubmit={handleSendMessage}
            placeholder="¿Qué pasó hoy?"
            isRecording={isRecording}
            recordingTime={recordingTime}
            onStartRecording={onVoiceRecord ? handleStartRecording : undefined}
            onStopRecording={stopRecording}
            onCancelRecording={cancelRecording}
            permissionError={permissionError}
          />
        </footer>
      </div>
    </div>
  )
}

export default ChatView
