import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BottomNav, type Screen } from './components/BottomNav'
import { DiagnosticModal } from './components/DiagnosticModal'
import { LlorometroTopSheet } from './components/LlorometroTopSheet'
import { ThinkingState } from './components/ThinkingState'
import { getStoredDrops, saveDrop, type LloroItem } from './services/lloros'
import { generateDiagnosis, generateGotitaReply } from './services/ai'
import { ChatView, type ChatMessage } from './views/ChatView'
import { HomeView } from './views/HomeView'
import { LluviaFeedView } from './views/LluviaFeedView'
import { ProfileView } from './views/ProfileView'

type Theme = 'claro' | 'oscuro' | 'automatico'

// TODO: reemplazar por la respuesta real del backend
const MOCK_REPLIES = [
  'Mmm. Qué interesante. Y yo que pensaba que mi día era malo.',
  'Seguí, seguí. No me voy a ir a ningún lado. Soy una gota.',
  'Eso suena agotador. Tomá agua, en serio.',
]

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false)
  const [isLlorometroOpen, setIsLlorometroOpen] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [activeDiagnosis, setActiveDiagnosis] = useState('')
  const [currentDraftText, setCurrentDraftText] = useState('')
  const [drops, setDrops] = useState<LloroItem[]>(getStoredDrops)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [username, setUsername] = useState('Llorón Profesional')
  const [theme, setTheme] = useState<Theme>('oscuro')
  const [alarmEnabled, setAlarmEnabled] = useState(true)

  const nextId = useRef(1)
  const replyIndex = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])

  const pushMessage = (sender: ChatMessage['sender'], text: string) =>
    setMessages((prev) => [...prev, { id: String(nextId.current++), sender, text }])

  const handleSendMessage = async (text: string) => {
    pushMessage('user', text)
    try {
      const reply = await generateGotitaReply(text, messages)
      pushMessage('gotita', reply)
    } catch {
      const reply = MOCK_REPLIES[replyIndex.current++ % MOCK_REPLIES.length]
      timers.current.push(window.setTimeout(() => pushMessage('gotita', reply), 600))
    }
  }

  // Home: al enviar un lloro, muestra ThinkingState mientras Gemini genera la respuesta y pasa al ChatView
  const handleSubmitDraft = async (text: string) => {
    if (isThinking) return
    setCurrentDraftText(text)
    setIsThinking(true)
    try {
      const diagnosis = await generateDiagnosis(text)
      setActiveDiagnosis(diagnosis)
      nextId.current = 1
      setMessages([
        { id: String(nextId.current++), sender: 'user', text },
        { id: String(nextId.current++), sender: 'gotita', text: diagnosis },
      ])
      setCurrentScreen('chat')
    } catch (error) {
      console.error('[Gemini] Error en handleSubmitDraft:', error)
    } finally {
      setIsThinking(false)
    }
  }

  // Diagnóstico → "Aceptar mi destino": conversación privada con Gotita
  const handleAcceptDestiny = () => {
    setIsDiagnosticOpen(false)
    nextId.current = 1
    setMessages([
      { id: String(nextId.current++), sender: 'user', text: currentDraftText },
      { id: String(nextId.current++), sender: 'gotita', text: activeDiagnosis },
    ])
    setCurrentDraftText('')
    setCurrentScreen('chat')
  }

  // Diagnóstico → "Compartir drama": Muro con el Llorómetro abierto
  const handleShareDrama = () => {
    setIsDiagnosticOpen(false)
    setCurrentScreen('feed')
    setIsLlorometroOpen(true)
  }

  // Llorómetro → "Soltar a la lluvia"
  const handleReleaseLloro = (level: number) => {
    const text = currentDraftText.trim()
    if (text) {
      const item = saveDrop(text, level)
      setDrops((prev) => [item, ...prev])
    }
    setIsLlorometroOpen(false)
    setCurrentDraftText('')
  }

  const goHome = () => {
    setIsLlorometroOpen(false)
    setCurrentScreen('home')
  }

  const showBottomNav = currentScreen === 'home' || currentScreen === 'feed' || currentScreen === 'profile'

  return (
    <div className="max-w-md mx-auto min-h-[100dvh] bg-[#0E131F] relative overflow-hidden font-['Lato']">
      <AnimatePresence mode="wait">
        {currentScreen === 'home' && (
          <HomeView
            key="home"
            onSubmitDraft={handleSubmitDraft}
          />
        )}

        {currentScreen === 'chat' && (
          <ChatView
            key="chat"
            messages={messages}
            onBack={goHome}
            onSendMessage={handleSendMessage}
            onSubmitDraft={handleSubmitDraft}
            onVoiceRecord={() => {}}
          />
        )}

        {currentScreen === 'feed' && <LluviaFeedView key="feed" drops={drops} />}

        {currentScreen === 'profile' && (
          // TODO: usuario, estadísticas y alarma reales desde el backend
          <ProfileView
            key="profile"
            username={username}
            stats={{ volumen: '3.8 L', dramaPromedio: '7.2', rachaActiva: '14 días' }}
            onSaveUsername={setUsername}
            currentTheme={theme}
            onThemeChange={setTheme}
            alarmTime="20:00 hs"
            isAlarmEnabled={alarmEnabled}
            onToggleAlarm={setAlarmEnabled}
            onClearHistory={() => {
              if (window.confirm('¿Borrar todo tu historial de penas?')) setMessages([])
            }}
          />
        )}
      </AnimatePresence>

      {showBottomNav && (
        <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      )}

      <ThinkingState isVisible={isThinking} />

      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        diagnosisText={activeDiagnosis}
        onAcceptDestiny={handleAcceptDestiny}
        onShareDrama={handleShareDrama}
        onClose={() => setIsDiagnosticOpen(false)}
      />

      <LlorometroTopSheet
        isOpen={isLlorometroOpen}
        onClose={() => setIsLlorometroOpen(false)}
        onRelease={handleReleaseLloro}
      />
    </div>
  )
}

export default App
