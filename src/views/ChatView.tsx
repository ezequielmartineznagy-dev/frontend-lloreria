import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Gotita } from '../components/Gotita'
import { LloroInput } from '../components/LloroInput'

export interface ChatMessage {
  id: number
  author: 'user' | 'gotita'
  text: string
}

interface ChatViewProps {
  initialMessages: ChatMessage[]
  onBack: () => void
}

// TODO: reemplazar por la respuesta real del backend
const MOCK_REPLIES = [
  'Mmm. Qué interesante. Y yo que pensaba que mi día era malo.',
  'Seguí, seguí. No me voy a ir a ningún lado. Soy una gota.',
  'Eso suena agotador. Tomá agua, en serio.',
]

export const ChatView: React.FC<ChatViewProps> = ({ initialMessages, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputText, setInputText] = useState('')
  const nextId = useRef(initialMessages.length + 1)
  const replyIndex = useRef(0)
  const timers = useRef<number[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])

  const handleSend = () => {
    const text = inputText.trim()
    if (!text) return
    setInputText('')
    sendUserMessage(text)
  }

  const handleVoice = (audio: Blob) => {
    console.log('Audio grabado:', audio.type, audio.size)
    // TODO: enviar el audio al backend
    sendUserMessage('🎤 Nota de voz')
  }

  const sendUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: nextId.current++, author: 'user', text }])

    const reply = MOCK_REPLIES[replyIndex.current++ % MOCK_REPLIES.length]
    const t = window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId.current++, author: 'gotita', text: reply }])
    }, 900)
    timers.current.push(t)
  }

  return (
    <main className="h-[100dvh] w-full bg-[#0E131F]">
      <div className="w-full max-w-md mx-auto h-full flex flex-col px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <header className="flex items-center gap-3 pb-4 border-b border-white/5">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver al inicio"
            className="p-2 -ml-2 rounded-full text-[#8E9CAE] hover:text-[#4EA8DE] transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]"
          >
            <ArrowLeft className="w-6 h-6" aria-hidden="true" />
          </button>
          <Gotita size={36} />
          <div>
            <h1 className="font-['Quicksand',sans-serif] font-bold text-xl text-white tracking-wide leading-tight">
              Gotita
            </h1>
            <p className="font-['Lato',sans-serif] text-sm text-[#8E9CAE]">Te escucha (sin ganas)</p>
          </div>
        </header>

        <section
          className="flex-1 overflow-y-auto py-6 flex flex-col gap-3"
          role="log"
          aria-live="polite"
          aria-label="Conversación con Gotita"
        >
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={
                m.author === 'user'
                  ? "self-end max-w-[85%] bg-[#4EA8DE] text-[#0E131F] rounded-3xl rounded-br-md px-4 py-3 font-['Lato',sans-serif] text-base"
                  : "self-start max-w-[85%] bg-[#161F33] text-white rounded-3xl rounded-bl-md px-4 py-3 font-['Quicksand',sans-serif] font-semibold text-base"
              }
            >
              {m.text}
            </motion.div>
          ))}
          <div ref={endRef} />
        </section>

        <footer className="pt-2">
          <LloroInput
            value={inputText}
            onChange={setInputText}
            onSubmit={handleSend}
            onVoiceRecord={handleVoice}
            placeholder="Contale a Gotita..."
          />
        </footer>
      </div>
    </main>
  )
}

export default ChatView


