import { useEffect, useRef, useState } from 'react'
import { HomeView } from './views/HomeView'
import { ChatView, type ChatMessage } from './views/ChatView'

// TODO: reemplazar por la respuesta real del backend
const MOCK_REPLIES = [
  'Mmm. Qué interesante. Y yo que pensaba que mi día era malo.',
  'Seguí, seguí. No me voy a ir a ningún lado. Soy una gota.',
  'Eso suena agotador. Tomá agua, en serio.',
]

function App() {
  const [view, setView] = useState<'home' | 'chat'>('home')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const nextId = useRef(1)
  const replyIndex = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])

  const push = (sender: ChatMessage['sender'], text: string) =>
    setMessages((prev) => [...prev, { id: String(nextId.current++), sender, text }])

  const handleSendMessage = (text: string) => {
    push('user', text)
    const reply = MOCK_REPLIES[replyIndex.current++ % MOCK_REPLIES.length]
    timers.current.push(window.setTimeout(() => push('gotita', reply), 900))
  }

  if (view === 'chat') {
    return (
      <ChatView
        messages={messages}
        onBack={() => setView('home')}
        onSendMessage={handleSendMessage}
        // TODO: grabación real; por ahora simula una nota de voz
        onVoiceRecord={() => handleSendMessage('🎤 Nota de voz')}
      />
    )
  }

  return (
    <HomeView
      onAcceptDestiny={(userMessage, diagnosis) => {
        nextId.current = 1
        setMessages([
          { id: String(nextId.current++), sender: 'user', text: userMessage },
          { id: String(nextId.current++), sender: 'gotita', text: diagnosis },
        ])
        setView('chat')
      }}
    />
  )
}

export default App
