import { useEffect, useRef, useState } from 'react'
import { HomeView } from './views/HomeView'
import { ChatView, type ChatMessage } from './views/ChatView'
import { ProfileView } from './views/ProfileView'
import { LluviaFeedView } from './views/LluviaFeedView'

// TODO: reemplazar por la respuesta real del backend
const MOCK_REPLIES = [
  'Mmm. Qué interesante. Y yo que pensaba que mi día era malo.',
  'Seguí, seguí. No me voy a ir a ningún lado. Soy una gota.',
  'Eso suena agotador. Tomá agua, en serio.',
]

function App() {
  const [view, setView] = useState<'home' | 'chat' | 'profile' | 'lluvia'>('home')
  const [theme, setTheme] = useState<'claro' | 'oscuro' | 'automatico'>('oscuro')
  const [ownLloro, setOwnLloro] = useState<string | undefined>()
  const [alarmEnabled, setAlarmEnabled] = useState(true)
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

  if (view === 'lluvia') {
    return <LluviaFeedView ownLloro={ownLloro} onBack={() => setView('home')} />
  }

  if (view === 'profile') {
    // TODO: usuario, estadísticas y alarma reales desde el backend
    return (
      <ProfileView
        onBack={() => setView('home')}
        username="Llorón Profesional"
        stats={{ volumen: '3.8 L', dramaPromedio: '7.2', rachaActiva: '14 días' }}
        onEditProfile={() => console.log('Editar perfil')}
        currentTheme={theme}
        onThemeChange={setTheme}
        alarmTime="20:00 hs"
        isAlarmEnabled={alarmEnabled}
        onToggleAlarm={setAlarmEnabled}
        onClearHistory={() => {
          if (window.confirm('¿Borrar todo tu historial de penas?')) setMessages([])
        }}
      />
    )
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
      onOpenProfile={() => setView('profile')}
      onShareDrama={(userMessage) => {
        setOwnLloro(userMessage)
        setView('lluvia')
      }}
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



