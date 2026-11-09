import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Mic, Send } from 'lucide-react'
import { Gotita } from '../components/Gotita'

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
}

export const ChatView: React.FC<ChatViewProps> = ({
  onBack,
  messages,
  onSendMessage,
  onVoiceRecord,
}) => {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Desplazamiento suave al cargar y al recibir nuevos mensajes
  useEffect(() => {
    const el = scrollRef.current
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSendMessage(text)
    setDraft('')
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-[100dvh] w-full bg-[#0E131F]"
    >
      <div className="w-full max-w-md mx-auto h-full flex flex-col justify-between">
        {/* Top bar */}
        <header className="flex items-center justify-between py-4 px-6 border-b border-[#161F33]">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="text-[#8E9CAE] hover:text-white transition-colors cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]"
          >
            <ArrowLeft size={24} aria-hidden="true" />
          </button>

          <div className="flex flex-col items-center text-center">
            <h1 className="font-['Quicksand',sans-serif] font-bold text-lg text-white">La Gotita</h1>
            <p className="font-['Lato',sans-serif] text-xs text-[#8E9CAE] inline-flex items-center gap-1.5">
              Escuchando desganado...
              <span className="w-2 h-2 rounded-full bg-[#8E9CAE]/60 inline-block" aria-hidden="true" />
            </p>
          </div>

          {/* Espaciador del mismo ancho que la flecha para centrar el título */}
          <span className="w-6" aria-hidden="true" />
        </header>

        {/* Mensajes */}
        <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto px-6 py-6">
          <ul className="space-y-4" aria-live="polite" aria-label="Conversación con La Gotita">
            {messages.map((m, i) => {
              const startsRun = messages[i - 1]?.sender !== m.sender

              if (m.sender === 'gotita') {
                return (
                  <li key={m.id} className="flex items-start gap-2.5 max-w-[85%]">
                    <Gotita size={26} className="flex-shrink-0 mt-1" />
                    <p
                      className={`selectable bg-[#161F33] rounded-2xl ${
                        startsRun ? 'rounded-tl-none' : ''
                      } p-4 text-white text-[15px] leading-relaxed font-['Quicksand',sans-serif]`}
                    >
                      {m.text}
                    </p>
                  </li>
                )
              }

              return (
                <li key={m.id} className="flex flex-col items-end max-w-[85%] ml-auto">
                  <p
                    className={`selectable bg-[#20293A] rounded-2xl ${
                      startsRun ? 'rounded-tr-none' : ''
                    } p-4 text-white text-[15px] leading-relaxed font-['Quicksand',sans-serif]`}
                  >
                    {m.text}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Barra de entrada */}
        <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2 bg-[#0E131F]">
          <form
            onSubmit={handleSubmit}
            className="flex items-center justify-between bg-[#161F33] rounded-full px-5 py-3.5 shadow-lg shadow-black/20"
            aria-label="Enviar mensaje a La Gotita"
          >
            <div className="flex-1 flex flex-col min-w-0">
              <label
                htmlFor="chat-draft"
                className="font-['Quicksand',sans-serif] text-[14px] text-white/90"
              >
                ¿Qué pasó hoy?
              </label>
              <input
                id="chat-draft"
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Escribí tu drama..."
                autoComplete="off"
                className="font-['Lato',sans-serif] text-sm text-[#8E9CAE] focus:outline-none bg-transparent placeholder-[#8E9CAE]/70 caret-[#4EA8DE] w-full"
              />
            </div>

            <div className="flex items-center">
              <span className="h-6 w-[1px] bg-white/10 mx-3" aria-hidden="true" />
              {onVoiceRecord && (
                <button
                  type="button"
                  onClick={onVoiceRecord}
                  aria-label="Grabar mensaje de voz"
                  className="text-[#8E9CAE] hover:text-[#4EA8DE] cursor-pointer transition-colors rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]"
                >
                  <Mic size={20} aria-hidden="true" />
                </button>
              )}
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label="Enviar mensaje"
                className="ml-3 text-[#4EA8DE] hover:text-[#3ba0de] cursor-pointer transition-colors rounded-full disabled:opacity-40 disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]"
              >
                <Send size={20} aria-hidden="true" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.main>
  )
}

export default ChatView

