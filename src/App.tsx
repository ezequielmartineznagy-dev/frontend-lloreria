import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { DiagnosticModal } from './components/DiagnosticModal'
import { LlorometroTopSheet } from './components/LlorometroTopSheet'
import { ThinkingState } from './components/ThinkingState'
import { getStoredDrops, saveDrop, type LloroItem } from './services/lloros'
import { getRandomDiagnosis } from './utils/diagnosis'
import { ChatView, type ChatMessage } from './views/ChatView'
import { HomeView } from './views/HomeView'
import { LluviaFeedView } from './views/LluviaFeedView'
import { ProfileView } from './views/ProfileView'

type Screen = 'home' | 'chat' | 'feed' | 'profile'
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

    const handleSendMessage = (text: string) => {
      pushMessage('user', text)
      const reply = MOCK_REPLIES[replyIndex.current++ % MOCK_REPLIES.length]
      timers.current.push(window.setTimeout(() => pushMessage('gotita', reply), 900))
    }

      // Home: el texto enviado muestra 'IA pensando' y luego abre el diagnóstico
      const handleSubmitDraft = (text: string) => {
        if (isThinking) return
        setCurrentDraftText(text)
        setIsThinking(true)
        // Simula el procesamiento de red de la IA (1.5 a 2 s) antes del veredicto
        const delay = 1500 + Math.random() * 500
        timers.current.push(
          window.setTimeout(() => {
            setActiveDiagnosis(getRandomDiagnosis())
            setIsThinking(false)
            setIsDiagnosticOpen(true)
          }, delay),
        )
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

          return (
    <div className="max-w-md mx-auto min-h-[100dvh] bg-[#0E131F] relative overflow-hidden font-['Lato']">
      <AnimatePresence mode="wait">
        {currentScreen === 'home' && (
          <HomeView
            key="home"
            onSubmitDraft={handleSubmitDraft}
            onOpenProfile={() => setCurrentScreen('profile')}
          />
        )}

        {currentScreen === 'chat' && (
          <ChatView
            key="chat"
            messages={messages}
            onBack={goHome}
            onSendMessage={handleSendMessage}
            // TODO: grabación real; por ahora simula una nota de voz
            onVoiceRecord={() => handleSendMessage('🎤 Nota de voz')}
          />
        )}

        {currentScreen === 'feed' && <LluviaFeedView key="feed" drops={drops} onBack={goHome} />}

        {currentScreen === 'profile' && (
          // TODO: usuario, estadísticas y alarma reales desde el backend
          <ProfileView
            key="profile"
            onBack={goHome}
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

