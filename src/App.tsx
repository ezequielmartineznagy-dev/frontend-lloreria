import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { DiagnosticModal } from './components/DiagnosticModal'
import { LlorometroTopSheet } from './components/LlorometroTopSheet'
import { ThinkingState } from './components/ThinkingState'
import { getStoredDrops, saveDrop, type LloroItem } from './services/lloros'
import { generateDiagnosis, generateGotitaReply } from './services/ai'
import { ChatView, type ChatMessage } from './views/ChatView'
import { HomeView } from './views/HomeView'
import { LluviaFeedView } from './views/LluviaFeedView'
import { ProfileView } from './views/ProfileView'

export type Screen = 'feed' | 'home' | 'chat' | 'profile'

type Theme = 'claro' | 'oscuro' | 'automatico'

// Orden espacial horizontal: Muro (izq = 0) -> Inicio / Chat (centro = 1) -> Perfil (der = 2)
const SCREEN_ORDER: Record<Screen, number> = {
  feed: 0,
  home: 1,
  chat: 1,
  profile: 2,
}

const DOTS: { key: Screen; label: string }[] = [
  { key: 'feed', label: 'Muro' },
  { key: 'home', label: 'Inicio' },
  { key: 'profile', label: 'Perfil' },
]

const getActiveDotIndex = (screen: Screen) => {
  if (screen === 'feed') return 0
  if (screen === 'profile') return 2
  return 1 // 'home' y 'chat'
}

const SWIPE_OFFSET_THRESHOLD = 50
const SWIPE_VELOCITY_THRESHOLD = 300

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : direction < 0 ? '-100%' : 0,
    opacity: 1,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : direction < 0 ? '100%' : 0,
    opacity: 1,
  }),
}

const pageTransition = {
  x: { type: 'spring' as const, stiffness: 320, damping: 32 },
  opacity: { duration: 0.15 },
}

// TODO: reemplazar por la respuesta real del backend
const MOCK_REPLIES = [
  'Mmm. Qué interesante. Y yo que pensaba que mi día era malo.',
  'Seguí, seguí. No me voy a ir a ningún lado. Soy una gota.',
  'Eso suena agotador. Tomá agua, en serio.',
]

export function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home')
  const [direction, setDirection] = useState<number>(0)
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

  const navigateTo = (target: Screen) => {
    if (target === currentScreen) return
    const currentIdx = SCREEN_ORDER[currentScreen]
    const targetIdx = SCREEN_ORDER[target]
    setDirection(targetIdx >= currentIdx ? 1 : -1)
    setCurrentScreen(target)
  }

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info
    const isSwipeLeft = offset.x < -SWIPE_OFFSET_THRESHOLD || velocity.x < -SWIPE_VELOCITY_THRESHOLD
    const isSwipeRight = offset.x > SWIPE_OFFSET_THRESHOLD || velocity.x > SWIPE_VELOCITY_THRESHOLD

    if (isSwipeLeft) {
      // Arrastre hacia la izquierda -> avanzar a la pantalla derecha lógica
      if (currentScreen === 'feed') {
        navigateTo('home')
      } else if (currentScreen === 'home') {
        navigateTo('profile')
      }
    } else if (isSwipeRight) {
      // Arrastre hacia la derecha -> avanzar a la pantalla izquierda lógica
      if (currentScreen === 'profile') {
        navigateTo('home')
      } else if (currentScreen === 'home') {
        navigateTo('feed')
      } else if (currentScreen === 'chat') {
        navigateTo('home')
      }
    }
  }

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
      setDirection(1)
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
    setDirection(1)
    setCurrentScreen('chat')
  }

  // Diagnóstico → "Compartir drama": Muro con el Llorómetro abierto
  const handleShareDrama = () => {
    setIsDiagnosticOpen(false)
    setDirection(-1)
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
    setDirection(-1)
    setCurrentScreen('home')
  }

  return (
    <div className="max-w-md mx-auto min-h-[100dvh] h-[100dvh] bg-[#0E131F] relative overflow-hidden font-['Lato'] select-none">
      {/* Indicador Visual de Paginación superior (Dots) */}
      <nav
        aria-label="Paginación horizontal"
        className="fixed top-4 top-[max(1rem,env(safe-area-inset-top))] left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 pointer-events-auto"
      >
        {DOTS.map((dot, idx) => {
          const isActive = getActiveDotIndex(currentScreen) === idx
          return (
            <button
              key={dot.key}
              type="button"
              onClick={() => navigateTo(dot.key)}
              aria-label={`Ir a ${dot.label}`}
              aria-current={isActive ? 'page' : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#4EA8DE] ${
                isActive ? 'w-3 bg-[#4EA8DE]' : 'w-1.5 bg-[#8E9CAE]/40 hover:bg-[#8E9CAE]/70'
              }`}
            />
          )
        })}
      </nav>

      {/* Orquestador de Gestos y Animaciones de Transición */}
      <AnimatePresence initial={false} custom={direction}>
        {currentScreen === 'feed' && (
          <motion.div
            key="feed"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-[100dvh] overflow-hidden"
          >
            <LluviaFeedView drops={drops} />
          </motion.div>
        )}

        {currentScreen === 'home' && (
          <motion.div
            key="home"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-[100dvh] overflow-hidden"
          >
            <HomeView onSubmitDraft={handleSubmitDraft} />
          </motion.div>
        )}

        {currentScreen === 'chat' && (
          <motion.div
            key="chat"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-[100dvh] overflow-hidden"
          >
            <ChatView
              messages={messages}
              onBack={goHome}
              onSendMessage={handleSendMessage}
              onSubmitDraft={handleSubmitDraft}
              onVoiceRecord={() => {}}
            />
          </motion.div>
        )}

        {currentScreen === 'profile' && (
          <motion.div
            key="profile"
            custom={direction}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={pageTransition}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-[100dvh] overflow-hidden"
          >
            <ProfileView
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
          </motion.div>
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
