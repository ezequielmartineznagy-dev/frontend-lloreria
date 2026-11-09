import { useState } from 'react'
import { HomeView } from './views/HomeView'
import { ChatView, type ChatMessage } from './views/ChatView'

type View = { name: 'home' } | { name: 'chat'; messages: ChatMessage[] }

function App() {
  const [view, setView] = useState<View>({ name: 'home' })

  if (view.name === 'chat') {
    return <ChatView initialMessages={view.messages} onBack={() => setView({ name: 'home' })} />
  }

  return (
    <HomeView
      onAcceptDestiny={(userMessage, diagnosis) =>
        setView({
          name: 'chat',
          messages: [
            { id: 1, author: 'user', text: userMessage },
            { id: 2, author: 'gotita', text: diagnosis },
          ],
        })
      }
    />
  )
}

export default App
