import React from 'react'
import { CloudRain, Home, User } from 'lucide-react'

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

const NAV_ITEMS: NavItem[] = [
  { screen: 'home', label: 'Inicio', icon: Home },
  { screen: 'feed', label: 'Muro', icon: CloudRain },
  { screen: 'profile', label: 'Perfil', icon: User },
]

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 inset-x-0 max-w-md mx-auto z-40 pb-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-[#161F33]/90 backdrop-blur-md border-t border-white/5 flex justify-around items-center h-16 px-4"
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
            className={`flex flex-col items-center justify-center gap-1 py-1 px-4 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE] ${
              isActive ? 'text-[#4EA8DE]' : 'text-[#8E9CAE] hover:text-white'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden={true} />
            <span className="font-['Lato',sans-serif] text-[11px] font-medium leading-none">
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav

