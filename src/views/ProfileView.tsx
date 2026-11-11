import React, { useState } from 'react'
import * as Switch from '@radix-ui/react-switch'
import { Pencil } from 'lucide-react'
import { EditProfileModal } from '../components/EditProfileModal'
import { Gotita } from '../components/Gotita'
import { useTheme, type Theme } from '../hooks/useTheme'

export type ThemeProp = Theme | 'claro' | 'oscuro' | 'automatico'

interface ProfileStats {
  volumen: string // ej. "3.8 L"
  dramaPromedio: string // ej. "7.2"
  rachaActiva: string // ej. "14 días"
}

interface ProfileViewProps {
  username: string
  stats: ProfileStats
  onSaveUsername: (newName: string) => void
  onThemeChange?: (theme: Theme) => void
  currentTheme?: ThemeProp
  alarmTime: string // ej. "20:00 hs"
  isAlarmEnabled: boolean
  onToggleAlarm: (enabled: boolean) => void
  onClearHistory: () => void
}

const THEMES: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'system', label: 'Automático' },
]

export const ProfileView: React.FC<ProfileViewProps> = ({
  username,
  stats,
  onSaveUsername,
  onThemeChange,
  currentTheme: propTheme,
  alarmTime,
  isAlarmEnabled,
  onToggleAlarm,
  onClearHistory,
}) => {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const normalizedProp = propTheme === 'oscuro'
    ? 'dark'
    : propTheme === 'claro'
      ? 'light'
      : propTheme === 'automatico'
        ? 'system'
        : propTheme

  const activeTheme = normalizedProp ?? theme

  const handleSelectTheme = (val: Theme) => {
    setTheme(val)
    onThemeChange?.(val)
  }

  const statCards = [
    { value: stats.volumen, label: 'Volumen' },
    { value: stats.dramaPromedio, label: 'Drama promedio' },
    { value: stats.rachaActiva, label: 'Racha activa' },
  ]

  return (
    <div
      role="main"
      className="no-scrollbar min-h-[100dvh] h-[100dvh] w-full overflow-y-auto bg-slate-50 dark:bg-[#0E131F] text-slate-900 dark:text-white select-none transition-colors duration-200"
    >
      <div className="w-full max-w-md mx-auto min-h-full px-6 py-6 pb-12 pb-[max(3rem,env(safe-area-inset-bottom))] pt-12 pt-[max(3rem,env(safe-area-inset-top))] flex flex-col">
        <header className="text-center mb-6 select-none">
          <h1 className="font-['Quicksand',sans-serif] font-bold text-2xl text-slate-900 dark:text-white">Perfil</h1>
        </header>

        <section aria-label="Identidad" className="flex flex-col items-center text-center mb-8 select-none">
          <div className="w-32 h-32 border-2 border-[#4EA8DE]/40 rounded-full bg-white dark:bg-[#161F33] shadow-sm dark:shadow-none flex items-center justify-center">
            <Gotita size={90} />
          </div>
          <h2 className="font-['Quicksand',sans-serif] font-bold text-xl text-slate-900 dark:text-white mt-4">
            {username}
          </h2>
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            onPointerDownCapture={(e) => e.stopPropagation()}
            className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#161F33] border border-slate-200 dark:border-[#8E9CAE]/20 text-xs font-['Lato',sans-serif] text-slate-500 dark:text-[#8E9CAE] hover:text-slate-900 dark:hover:text-white shadow-sm dark:shadow-none transition-all duration-150 active:scale-[0.96] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]"
          >
            <Pencil size={11} aria-hidden="true" />
            Editar perfil
          </button>
        </section>

        <section aria-label="Estadísticas" className="grid grid-cols-3 gap-3 mb-8 select-none">
          {statCards.map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-[#161F33] border border-slate-200 dark:border-white/5 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm dark:shadow-none"
            >
              <p className="font-['Quicksand',sans-serif] font-bold text-lg md:text-xl text-[#4EA8DE] mb-1">
                {s.value}
              </p>
              <p className="font-['Lato',sans-serif] text-[11px] font-medium text-slate-500 dark:text-[#8E9CAE] leading-tight">
                {s.label}
              </p>
            </div>
          ))}
        </section>

        <section
          aria-labelledby="ajustes-title"
          className="flex flex-col select-none"
          onPointerDownCapture={(e) => e.stopPropagation()}
        >
          <h2
            id="ajustes-title"
            className="font-['Quicksand',sans-serif] font-bold text-lg text-slate-900 dark:text-white mb-3 self-start"
          >
            Ajustes
          </h2>

          <div className="bg-white dark:bg-[#161F33] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden flex flex-col divide-y divide-slate-200 dark:divide-white/5 shadow-sm dark:shadow-none">
            <div className="p-5 flex flex-col gap-3">
              <p id="tema-label" className="font-['Lato',sans-serif] text-[15px] font-medium text-slate-900 dark:text-white">
                Tema visual
              </p>
              <div
                role="radiogroup"
                aria-labelledby="tema-label"
                className="grid grid-cols-3 bg-slate-100 dark:bg-[#0E131F] p-1 rounded-full border border-slate-200 dark:border-white/5"
              >
                {THEMES.map((t) => {
                  const selected = t.value === activeTheme
                  return (
                    <button
                      key={t.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => handleSelectTheme(t.value)}
                      className={`py-2 rounded-full font-['Quicksand',sans-serif] text-xs text-center transition-all duration-150 active:scale-[0.96] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE] ${
                        selected
                          ? 'font-bold bg-[#4EA8DE] text-white shadow-md shadow-[#4EA8DE]/15'
                          : 'font-medium bg-transparent text-slate-500 dark:text-[#8E9CAE] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div>
                <p
                  id="alarma-label"
                  className="font-['Lato',sans-serif] text-[15px] font-medium text-slate-900 dark:text-white"
                >
                  Alarma de desahogo
                </p>
                <p className="font-['Lato',sans-serif] text-xs text-slate-500 dark:text-[#8E9CAE] mt-0.5">{alarmTime}</p>
              </div>
              <Switch.Root
                checked={isAlarmEnabled}
                onCheckedChange={onToggleAlarm}
                aria-labelledby="alarma-label"
                className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-150 active:scale-[0.96] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4EA8DE]/60 data-[state=checked]:bg-[#4EA8DE] data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-[#0E131F] data-[state=unchecked]:border data-[state=unchecked]:border-slate-300 dark:data-[state=unchecked]:border-white/10"
              >
                <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-[22px]" />
              </Switch.Root>
            </div>
          </div>
        </section>

        <footer className="mt-auto pt-6 text-center select-none">
          <button
            type="button"
            onClick={onClearHistory}
            onPointerDownCapture={(e) => e.stopPropagation()}
            className="font-['Lato',sans-serif] text-xs text-red-500/90 dark:text-red-400/80 hover:text-red-600 dark:hover:text-red-400 transition-all duration-150 active:scale-[0.96] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 rounded"
          >
            Borrar todo mi historial de penas
          </button>
        </footer>
      </div>

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUsername={username}
        onSave={(newName) => {
          onSaveUsername(newName)
          setIsEditProfileOpen(false)
        }}
      />
    </div>
  )
}

export default ProfileView
