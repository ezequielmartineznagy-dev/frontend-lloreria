import React from 'react'
import { CloudRain, Droplet, User } from 'lucide-react'

export type Screen = 'home' | 'chat' | 'feed' | 'profile'

export interface BottomNavProps {
  currentScreen: Screen
  onNavigate: (screen: Screen) => void
}

interface NavItem {
  screen: Screen
  label: string
  icon: React.ComponentType<{
    size?: number
    className?: string
    strokeWidth?: number
    'aria-hidden'?: boolean | 'true' | 'false'
  }>
}

// Orden solicitado: Muro (izq), Inicio / Gotita (medio), Perfil (der)
const NAV_ITEMS: NavItem[] = [
  { screen: 'feed', label: 'Muro', icon: CloudRain },
  { screen: 'home', label: 'Inicio', icon: Droplet },
  { screen: 'profile', label: 'Perfil', icon: User },
]

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  return (
    <div className="fixed bottom-5 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Navegación principal"
        className="pointer-events-auto w-full max-w-[340px] bg-[#161F33]/95 backdrop-blur-md border border-white/10 rounded-full px-2 py-2 shadow-2xl shadow-black/50 flex items-center justify-around"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = currentScreen === item.screen
          const Icon = item.icon

          return (
            <button
              key={item.screen}
              type="button"
              onClick={() => onNavigate(item.screen)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-full transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]/60 ${
                isActive ? 'text-[#4EA8DE]' : 'text-[#8E9CAE] hover:text-white'
              }`}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.25 : 1.75}
                className={isActive && item.screen === 'home' ? 'fill-[#4EA8DE]/20' : ''}
                aria-hidden={true}
              />
              <span className="font-['Lato',sans-serif] text-[11px] font-medium leading-none tracking-wide">
                {item.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default BottomNav
